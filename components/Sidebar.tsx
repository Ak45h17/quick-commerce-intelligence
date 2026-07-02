import Link from "next/link";
import { BarChart3, Bell, Boxes, Building2, MapPinned, Settings, Store } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/products", label: "Products", icon: Boxes },
  { href: "/dashboard/cities/Pune", label: "Cities", icon: MapPinned },
  { href: "/dashboard/competitors", label: "Competitors", icon: Store }
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r bg-card px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            RB
          </div>
          <div>
            <p className="font-semibold">RiteBite Protein Bars</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/dashboard/settings"
        className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>

      <div className="mt-4 rounded-lg border bg-background p-3 text-xs text-muted-foreground">
        Google Analytics for Blinkit, Zepto, and Instamart.
      </div>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <div className="sticky top-0 z-20 border-b bg-card px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-semibold">RiteBite</span>
        </div>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live
        </span>
      </div>
    </div>
  );
}
