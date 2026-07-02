# Quick Commerce Intelligence

Google Analytics for Blinkit, Zepto, and Instamart.

## Problem / Solution

D2C brands selling on quick commerce platforms often do not know why sales dropped, why a competitor is winning, which cities are out of stock, or whether ad spend is working.

Quick Commerce Intelligence gives brand managers a city-level dashboard for rankings, stock availability, competitor pricing, and AI-generated action plans.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with shadcn-style components
- PostgreSQL via Prisma ORM
- Anthropic Claude API
- Recharts
- Vercel deployment target

## Setup

1. Clone the repo.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `ANTHROPIC_API_KEY`.
4. Run `npx prisma migrate dev --name init`.
5. Run `npm run seed`.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

Get an Anthropic API key at `https://console.anthropic.com`.

## Deploy To Vercel

Connect the GitHub repo to Vercel, add `DATABASE_URL` and `ANTHROPIC_API_KEY` in the Vercel dashboard, then deploy. Use Supabase Postgres for the database URL.

## Project Structure

```text
quick-commerce-intelligence/
  app/
    api/
      alerts/
      chat/
      generate-insight/
      run-engine/
    dashboard/
      alerts/
      cities/[city]/
      competitors/
      products/
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/
    AIChatPanel.tsx
    AlertCard.tsx
    CityHeatmap.tsx
    MetricCard.tsx
    PriceBarChart.tsx
    RankTrendChart.tsx
    RefreshEngineButton.tsx
    Sidebar.tsx
  lib/
    claude.ts
    dashboard-data.ts
    format.ts
    prisma.ts
    utils.ts
  prisma/
    schema.prisma
    seed.ts
```

## Demo Scenario

The seeded RiteBite story is designed to be obvious from the dashboard:

- Pune is out of stock on Blinkit for Chocolate Whey 1kg.
- Bangalore is undercut by HealthKart on Zepto for Peanut Butter Bar 6-pack.
- Mumbai search rank dropped from the top positions.
- Delhi has only 11 units left for Vanilla Whey 500g.
- Hyderabad has a new ProFit competitor SKU.
- Chennai recovered to rank #1 after yesterday's ad bid increase.

Run the alert engine from the dashboard to re-check latest snapshots and upsert rule-based alerts.
