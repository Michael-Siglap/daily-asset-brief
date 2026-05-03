import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { PortfolioProvider } from "@/context/PortfolioContext";

const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Daily Asset Brief",
  description: "Your personalized morning briefing for stocks, crypto, commodities & more",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Asset Brief",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} font-mono bg-zinc-950 text-white antialiased`}>
        <PortfolioProvider>
          <main className="min-h-screen max-w-lg mx-auto pb-24">
            {children}
          </main>
          <BottomNav />
        </PortfolioProvider>
      </body>
    </html>
  );
}
