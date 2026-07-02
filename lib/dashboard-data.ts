import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatPlatform } from "@/lib/format";

const cities = ["Mumbai", "Pune", "Bangalore", "Delhi", "Chennai", "Hyderabad"];
const platforms = ["blinkit", "zepto", "instamart"];

export async function getRecentAlerts(limit?: number) {
  const alerts = await prisma.alert.findMany({
    where: { brand: { slug: "ritebite" } },
    include: { product: true },
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {})
  });

  return alerts.map((alert) => ({
    ...alert,
    createdAt: alert.createdAt.toISOString()
  }));
}

export async function getRankTrendData() {
  const brand = await prisma.brand.findUnique({
    where: { slug: "ritebite" },
    include: { products: true }
  });

  if (!brand) return [];

  const snapshots = await prisma.snapshot.findMany({
    where: {
      productId: { in: brand.products.map((product) => product.id) }
    },
    include: { product: true },
    orderBy: { takenAt: "asc" }
  });

  const groups = new Map<string, Record<string, number[]>>();
  for (const snapshot of snapshots) {
    const key = format(snapshot.takenAt, "dd MMM");
    if (!groups.has(key)) groups.set(key, { Blinkit: [], Zepto: [], Instamart: [] });
    const group = groups.get(key);
    const platform = formatPlatform(snapshot.product.platform);
    if (group && snapshot.rank) group[platform].push(snapshot.rank);
  }

  return Array.from(groups.entries()).map(([date, ranks]) => ({
    date,
    Blinkit: average(ranks.Blinkit),
    Zepto: average(ranks.Zepto),
    Instamart: average(ranks.Instamart)
  }));
}

export async function getHeatmapData() {
  const products = await prisma.product.findMany({
    where: { brand: { slug: "ritebite" } },
    include: {
      snapshots: {
        orderBy: { takenAt: "desc" }
      }
    }
  });

  return cities.flatMap((city) =>
    platforms.map((platform) => {
      const platformProducts = products.filter((product) => product.platform === platform);
      const latest = platformProducts
        .map((product) => product.snapshots.find((snapshot) => snapshot.city === city))
        .filter(Boolean);
      const rankValues = latest.map((snapshot) => snapshot?.rank).filter((rank): rank is number => Boolean(rank));
      const stockValues = latest
        .map((snapshot) => snapshot?.stockUnits)
        .filter((stock): stock is number => stock !== null && stock !== undefined);

      return {
        city,
        platform,
        rank: rankValues.length ? Math.round(average(rankValues)) : null,
        inStock: latest.every((snapshot) => snapshot?.inStock),
        stockUnits: stockValues.length ? Math.min(...stockValues) : null
      };
    })
  );
}

export async function getLatestProductRows() {
  const products = await prisma.product.findMany({
    where: { brand: { slug: "ritebite" } },
    include: {
      snapshots: {
        orderBy: { takenAt: "desc" }
      }
    },
    orderBy: [{ name: "asc" }, { platform: "asc" }]
  });

  return products.flatMap((product) =>
    cities.map((city) => {
      const snapshot = product.snapshots.find((item) => item.city === city);
      return {
        id: `${product.id}-${city}`,
        productName: product.name,
        platform: product.platform,
        city,
        price: snapshot?.price ?? 0,
        rank: snapshot?.rank ?? null,
        inStock: snapshot?.inStock ?? false,
        stockUnits: snapshot?.stockUnits ?? null,
        takenAt: snapshot?.takenAt.toISOString() ?? null
      };
    })
  );
}

export async function getCityData(city: string) {
  const rows = (await getLatestProductRows()).filter((row) => row.city.toLowerCase() === city.toLowerCase());
  const competitors = await prisma.competitor.findMany({
    where: { city: { equals: city, mode: "insensitive" } },
    orderBy: { price: "asc" }
  });
  const alerts = await prisma.alert.findMany({
    where: { city: { equals: city, mode: "insensitive" }, brand: { slug: "ritebite" } },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  const priceData = [
    ...rows.slice(0, 4).map((row) => ({ name: `${row.productName.split(" ")[0]} ${formatPlatform(row.platform)}`, price: row.price })),
    ...competitors.map((competitor) => ({ name: competitor.name, price: competitor.price }))
  ];

  return {
    rows,
    competitors,
    priceData,
    alerts: alerts.map((alert) => ({ ...alert, createdAt: alert.createdAt.toISOString() }))
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}
