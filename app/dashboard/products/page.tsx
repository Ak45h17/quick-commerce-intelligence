import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLatestProductRows } from "@/lib/dashboard-data";
import { formatPlatform, formatRupees } from "@/lib/format";

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const rows = await getLatestProductRows();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">Latest city-level product snapshot for every platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Current price</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Stock status</TableHead>
                <TableHead>Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.productName}</TableCell>
                  <TableCell>{formatPlatform(row.platform)}</TableCell>
                  <TableCell>{row.city}</TableCell>
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
                  <TableCell>{row.takenAt ? formatDistanceToNow(new Date(row.takenAt), { addSuffix: true }) : "NA"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
