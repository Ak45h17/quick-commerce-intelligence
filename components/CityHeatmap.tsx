"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPlatform } from "@/lib/format";
import { cn } from "@/lib/utils";

type HeatmapCell = {
  city: string;
  platform: string;
  rank: number | null;
  inStock: boolean;
  stockUnits: number | null;
};

const cities = ["Mumbai", "Pune", "Bangalore", "Delhi", "Chennai", "Hyderabad"];
const platforms = ["blinkit", "zepto", "instamart"];

function cellClass(cell?: HeatmapCell) {
  if (!cell || !cell.inStock) return "bg-red-50 text-red-800 border-red-200";
  if ((cell.rank ?? 9) <= 3 && (cell.stockUnits ?? 999) >= 20) return "bg-green-50 text-green-800 border-green-200";
  return "bg-amber-50 text-amber-800 border-amber-200";
}

export function CityHeatmap({ data }: { data: HeatmapCell[] }) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>City stock heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-2 text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-muted-foreground">City</th>
                {platforms.map((platform) => (
                  <th key={platform} className="px-2 py-1 text-left text-muted-foreground">
                    {formatPlatform(platform)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city}>
                  <td className="px-2 py-2 font-medium">{city}</td>
                  {platforms.map((platform) => {
                    const cell = data.find((item) => item.city === city && item.platform === platform);
                    return (
                      <td key={platform}>
                        <button
                          className={cn("w-full rounded-md border px-3 py-3 text-left transition hover:shadow-sm", cellClass(cell))}
                          onClick={() => router.push(`/dashboard/cities/${city}`)}
                        >
                          <span className="block font-semibold">{cell?.rank ? `#${cell.rank}` : "NA"}</span>
                          <span className="block text-xs">
                            {!cell?.inStock ? "Out of stock" : (cell.stockUnits ?? 0) < 20 ? "Low stock" : "In stock"}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
