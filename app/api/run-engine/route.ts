import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function alertSeverityFromPriceGap(gap: number) {
  if (gap >= 0.1) return "critical";
  if (gap >= 0.05) return "warning";
  return null;
}

function rankSeverity(drop: number) {
  if (drop > 4) return "critical";
  if (drop > 2) return "warning";
  return null;
}

export async function POST() {
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug: "ritebite" },
      include: { products: true }
    });

    if (!brand) {
      return NextResponse.json({ error: "Seed the database first." }, { status: 404 });
    }

    const created = [];

    for (const product of brand.products) {
      const latestByCity = await Promise.all(
        ["Mumbai", "Pune", "Bangalore", "Delhi", "Chennai", "Hyderabad"].map(async (city) => {
          const snapshots = await prisma.snapshot.findMany({
            where: { productId: product.id, city },
            orderBy: { takenAt: "desc" },
            take: 2
          });

          return { city, snapshots };
        })
      );

      for (const { city, snapshots } of latestByCity) {
        const latest = snapshots[0];
        const previous = snapshots[1];
        if (!latest) continue;

        if (!latest.inStock) {
          created.push(
            await prisma.alert.upsert({
              where: {
                brandId_type_title_platform_city: {
                  brandId: brand.id,
                  type: "oos",
                  title: `Out of stock - ${product.name}`,
                  platform: product.platform,
                  city
                }
              },
              update: { resolved: false, severity: "critical" },
              create: {
                brandId: brand.id,
                productId: product.id,
                severity: "critical",
                type: "oos",
                title: `Out of stock - ${product.name}`,
                body: `${product.name} is unavailable on ${product.platform} in ${city}.`,
                insight: "Expected sales loss is high while the SKU is unavailable. Raise a replenishment request and shift ad spend to cities where inventory is healthy.",
                platform: product.platform,
                city
              }
            })
          );
        }

        if (latest.inStock && latest.stockUnits !== null && latest.stockUnits < 20) {
          created.push(
            await prisma.alert.upsert({
              where: {
                brandId_type_title_platform_city: {
                  brandId: brand.id,
                  type: "low_stock",
                  title: `Low stock warning - ${product.name}`,
                  platform: product.platform,
                  city
                }
              },
              update: { resolved: false, severity: "warning" },
              create: {
                brandId: brand.id,
                productId: product.id,
                severity: "warning",
                type: "low_stock",
                title: `Low stock warning - ${product.name}`,
                body: `${city} has ${latest.stockUnits} units left on ${product.platform}.`,
                insight: "Inventory is close to sell-out. Prioritize dark-store replenishment before evening peak demand to prevent missed revenue.",
                platform: product.platform,
                city
              }
            })
          );
        }

        const drop = previous?.rank && latest.rank ? latest.rank - previous.rank : 0;
        const severity = rankSeverity(drop);
        if (severity) {
          created.push(
            await prisma.alert.upsert({
              where: {
                brandId_type_title_platform_city: {
                  brandId: brand.id,
                  type: "rank_drop",
                  title: `Search rank dropped - ${product.name}`,
                  platform: product.platform,
                  city
                }
              },
              update: { resolved: false, severity },
              create: {
                brandId: brand.id,
                productId: product.id,
                severity,
                type: "rank_drop",
                title: `Search rank dropped - ${product.name}`,
                body: `Rank moved from #${previous?.rank} to #${latest.rank} in ${city}.`,
                insight: "Rank loss is likely to reduce impressions during peak hours. Check sponsored competition and consider a temporary bid increase.",
                platform: product.platform,
                city
              }
            })
          );
        }

        const competitors = await prisma.competitor.findMany({
          where: { platform: product.platform, city }
        });

        for (const competitor of competitors) {
          const gap = (latest.price - competitor.price) / latest.price;
          const competitorSeverity = alertSeverityFromPriceGap(gap);
          if (!competitorSeverity) continue;

          created.push(
            await prisma.alert.upsert({
              where: {
                brandId_type_title_platform_city: {
                  brandId: brand.id,
                  type: "price_drop",
                  title: `Competitor price drop - ${product.name}`,
                  platform: product.platform,
                  city
                }
              },
              update: { resolved: false, severity: competitorSeverity },
              create: {
                brandId: brand.id,
                productId: product.id,
                severity: competitorSeverity,
                type: "price_drop",
                title: `Competitor price drop - ${product.name}`,
                body: `${competitor.name} is priced lower than ${product.name} in ${city}.`,
                insight: "The competitor discount is large enough to affect conversion. Consider a coupon or pack-size offer for this city and platform.",
                platform: product.platform,
                city
              }
            })
          );
        }
      }
    }

    return NextResponse.json({ alertsTouched: created.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to run alert engine." }, { status: 500 });
  }
}
