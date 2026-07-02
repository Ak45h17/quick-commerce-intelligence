import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MobileHeader, Sidebar } from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quick Commerce Intelligence",
  description: "Google Analytics for Blinkit, Zepto, and Instamart."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen lg:flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <MobileHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
