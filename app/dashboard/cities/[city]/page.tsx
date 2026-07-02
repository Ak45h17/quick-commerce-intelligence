import { AlertCard } from "@/components/AlertCard";
import { PriceBarChart } from "@/components/PriceBarChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCityData } from "@/lib/dashboard-data";
import { formatPlatform, formatRupees } from "@/lib/format";

export const dynamic = 'force-dynamic'

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = decodeURIComponent(params.city);
  const { rows, priceData, alerts } = await getCityData(city);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">{city}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Product health, pricing, and alerts for this city.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Product status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.productName}</TableCell>
                    <TableCell>{formatPlatform(row.platform)}</TableCell>
                    <TableCell>{formatRupees(row.price)}</TableCell>
                    <TableCell>{row.rank ? `#${row.rank}` : "NA"}</TableCell>
                    <TableCell>
                      {!row.inStock ? (
                        <Badge variant="critical">Out of stock</Badge>
                      ) : (row.stockUnits ?? 0) < 20 ? (
                        <Badge variant="warning">Low stock</Badge>
                      ) : (
                        <Badge variant="success">In stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <PriceBarChart data={priceData} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Alerts in {city}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
          {!alerts.length && <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No alerts in this city.</div>}
        </div>
      </section>
    </main>
  );
}
