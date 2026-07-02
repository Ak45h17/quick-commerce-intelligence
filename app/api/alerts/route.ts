import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const severityOrder: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const resolved = searchParams.get("resolved");

    const alerts = await prisma.alert.findMany({
      where: {
        brand: { slug: "ritebite" },
        ...(severity ? { severity } : {}),
        ...(resolved === null ? {} : { resolved: resolved === "true" })
      },
      include: { product: true },
      orderBy: [{ resolved: "asc" }, { createdAt: "desc" }]
    });

    const sorted = alerts.sort((a, b) => {
      if (a.resolved !== b.resolved) return Number(a.resolved) - Number(b.resolved);
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return NextResponse.json({ alerts: sorted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch alerts." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string; resolved?: boolean };

    if (!body.id) {
      return NextResponse.json({ error: "Alert id is required." }, { status: 400 });
    }

    const alert = await prisma.alert.update({
      where: { id: body.id },
      data: { resolved: body.resolved ?? true }
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update alert." }, { status: 500 });
  }
}
