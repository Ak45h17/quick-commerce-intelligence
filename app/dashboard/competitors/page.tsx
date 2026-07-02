import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatPlatform, formatRupees } from "@/lib/format";

export const dynamic = 'force-dynamic'

export default async function CompetitorsPage() {
  const competitors = await prisma.competitor.findMany({
    orderBy: [{ city: "asc" }, { price: "asc" }]
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">Competitors</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seeded competitor threats used by the demo engine.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tracked competitor SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>City</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell>{formatPlatform(competitor.platform)}</TableCell>
                  <TableCell>{competitor.city}</TableCell>
                  <TableCell>{competitor.sku}</TableCell>
                  <TableCell>{formatRupees(competitor.price)}</TableCell>
                  <TableCell>{competitor.rank ? <Badge variant="outline">#{competitor.rank}</Badge> : "NA"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
