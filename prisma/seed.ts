import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const platforms = ["blinkit", "zepto", "instamart"];
const cities = ["Mumbai", "Pune", "Bangalore", "Delhi", "Chennai", "Hyderabad"];
const products = [
  { name: "Chocolate Whey 1kg", sku: "CHW-1KG", basePrice: 999, category: "whey-protein" },
  { name: "Vanilla Whey 500g", sku: "VAW-500G", basePrice: 699, category: "whey-protein" },
  { name: "Peanut Butter Bar 6-pack", sku: "PBB-6PK", basePrice: 499, category: "protein-bars" },
  { name: "Mixed Flavor 12-pack", sku: "MXF-12PK", basePrice: 699, category: "protein-bars" }
];

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function priceFor(basePrice: number, day: number, cityIndex: number, platformIndex: number) {
  const fluctuation = ((day + cityIndex + platformIndex) % 11 - 5) / 100;
  return Math.round(basePrice * (1 + fluctuation));
}

function rankFor(day: number, cityIndex: number, productIndex: number, platformIndex: number) {
  return Math.max(1, Math.min(8, 2 + ((day + cityIndex + productIndex + platformIndex) % 6)));
}

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: "ritebite" },
    update: {
      name: "RiteBite Protein Bars",
      category: "health-food"
    },
    create: {
      name: "RiteBite Protein Bars",
      slug: "ritebite",
      category: "health-food"
    }
  });

  const productRecords = [];

  for (let productIndex = 0; productIndex < products.length; productIndex += 1) {
    const product = products[productIndex];
    for (const platform of platforms) {
      const record = await prisma.product.upsert({
        where: { sku_platform: { sku: product.sku, platform } },
        update: {
          brandId: brand.id,
          name: product.name,
          category: product.category
        },
        create: {
          brandId: brand.id,
          name: product.name,
          sku: product.sku,
          platform,
          category: product.category
        }
      });

      productRecords.push({ ...record, basePrice: product.basePrice, productIndex });
    }
  }

  for (const product of productRecords) {
    const platformIndex = platforms.indexOf(product.platform);

    for (let cityIndex = 0; cityIndex < cities.length; cityIndex += 1) {
      const city = cities[cityIndex];
      for (let day = 6; day >= 0; day -= 1) {
        const takenAt = daysAgo(day);
        const isLatest = day === 0;
        const isYesterday = day === 1;
        const chocolatePuneBlinkit =
          city === "Pune" && product.platform === "blinkit" && product.sku === "CHW-1KG" && (isLatest || isYesterday);
        const vanillaHyderabadZepto =
          city === "Hyderabad" && product.platform === "zepto" && product.sku === "VAW-500G" && isLatest;
        const isLowDelhiInstamart =
          city === "Delhi" && product.platform === "instamart" && product.sku === "VAW-500G" && isLatest;
        const inStock = !(chocolatePuneBlinkit || vanillaHyderabadZepto);
        const stockUnits = !inStock
          ? 0
          : isLowDelhiInstamart
            ? 11
            : 50 + ((day + cityIndex + product.productIndex + platformIndex) * 17) % 151;

        await prisma.snapshot.upsert({
          where: { productId_city_takenAt: { productId: product.id, city, takenAt } },
          update: {
            price: priceFor(product.basePrice, day, cityIndex, platformIndex),
            inStock,
            stockUnits,
            rank: rankFor(day, cityIndex, product.productIndex, platformIndex)
          },
          create: {
            productId: product.id,
            city,
            price: priceFor(product.basePrice, day, cityIndex, platformIndex),
            inStock,
            stockUnits,
            rank: rankFor(day, cityIndex, product.productIndex, platformIndex),
            takenAt
          }
        });
      }
    }
  }

  const competitors = [
    ...platforms.map((platform) => ({
      name: "MuscleBlaze",
      platform,
      sku: "MB-WHEY-1KG",
      price: 899,
      city: "Pune",
      rank: 1
    })),
    {
      name: "HealthKart",
      platform: "zepto",
      sku: "HK-PBB-6PK",
      price: 409,
      city: "Bangalore",
      rank: 2
    },
    {
      name: "ProFit",
      platform: "zepto",
      sku: "PF-12BAR",
      price: 649,
      city: "Hyderabad",
      rank: 8
    }
  ];

  for (const competitor of competitors) {
    await prisma.competitor.upsert({
      where: {
        name_platform_sku_city: {
          name: competitor.name,
          platform: competitor.platform,
          sku: competitor.sku,
          city: competitor.city
        }
      },
      update: competitor,
      create: competitor
    });
  }

  const productBySkuPlatform = new Map(productRecords.map((product) => [`${product.sku}:${product.platform}`, product.id]));
  const alerts = [
    {
      severity: "critical",
      type: "oos",
      platform: "blinkit",
      city: "Pune",
      productId: productBySkuPlatform.get("CHW-1KG:blinkit"),
      title: "Out of stock - Chocolate Whey 1kg",
      body: "Product has been unavailable for 3h 40m. 14 competitor SKUs in stock in same category.",
      insight:
        "Sales may drop 60-80% while OOS. Competitor MuscleBlaze 1kg is showing in the top slot your product previously held. Recommend raising a replenishment request immediately.",
      resolved: false
    },
    {
      severity: "critical",
      type: "price_drop",
      platform: "zepto",
      city: "Bangalore",
      productId: productBySkuPlatform.get("PBB-6PK:zepto"),
      title: "Competitor price drop - Peanut Butter Bar 6-pack",
      body: "HealthKart dropped price by 18% (Rs.499 -> Rs.409). Your SKU is now Rs.90 more expensive in the same search results page.",
      insight:
        "Historical data shows 12% CTR drop when price differential exceeds Rs.70. You are currently at Rs.90. Consider a limited discount or coupon to close the gap before weekend peak hours.",
      resolved: false
    },
    {
      severity: "warning",
      type: "rank_drop",
      platform: "blinkit",
      city: "Mumbai",
      productId: productBySkuPlatform.get("PBB-6PK:blinkit"),
      title: "Search rank dropped - protein bar keyword",
      body: "Ranking slipped from #2 to #5 for protein bar in Mumbai. Three new sponsored listings appeared above your organic slot.",
      insight:
        "Rank loss is driven by increased ad competition, not a listing quality issue. Increasing your Blinkit ad bid by Rs.1-2 on this keyword may recover the top-3 position during peak hours (6-9pm).",
      resolved: false
    },
    {
      severity: "warning",
      type: "low_stock",
      platform: "instamart",
      city: "Delhi",
      productId: productBySkuPlatform.get("VAW-500G:instamart"),
      title: "Low stock warning - Vanilla Whey 500g",
      body: "Inventory at Delhi dark store is at 11 units. At current sell-through rate, stock will run out in ~6 hours.",
      insight:
        "Delhi evenings (5-9pm) have 3x your average order volume. An OOS event during that window would cost an estimated Rs.18,000-22,000 in missed revenue today.",
      resolved: false
    },
    {
      severity: "info",
      type: "competitor_new",
      platform: "zepto",
      city: "Hyderabad",
      productId: productBySkuPlatform.get("MXF-12PK:zepto"),
      title: "New competitor listing detected",
      body: "Brand ProFit launched a new 12-bar multipack SKU at Rs.649. Not yet showing in top search results but indexed on platform.",
      insight:
        "New SKU is priced 8% below your 12-pack. No sales velocity data yet, but worth monitoring over next 48h - if it gains traction it could erode your bundle conversion rate.",
      resolved: false
    },
    {
      severity: "success",
      type: "rank_recovered",
      platform: "blinkit",
      city: "Chennai",
      productId: productBySkuPlatform.get("CHW-1KG:blinkit"),
      title: "Rank recovered - whey protein keyword",
      body: "After ad bid adjustment yesterday, ranking returned to #1 for whey protein in Chennai. Impression share up 22%.",
      insight:
        "Recovery took ~4 hours after bid increase. Chennai performance is now back to baseline. No further action needed - this alert is resolved.",
      resolved: true
    }
  ];

  for (const alert of alerts) {
    await prisma.alert.upsert({
      where: {
        brandId_type_title_platform_city: {
          brandId: brand.id,
          type: alert.type,
          title: alert.title,
          platform: alert.platform,
          city: alert.city
        }
      },
      update: alert,
      create: {
        ...alert,
        brandId: brand.id
      }
    });
  }

  console.log("Seeded Quick Commerce Intelligence demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
