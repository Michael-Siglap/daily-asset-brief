import BottomNav from "@/components/BottomNav";
import GlobalModals from "@/components/GlobalModals";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "@/components/Toast";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ToastProvider } from "@/context/ToastContext";
import { UIProvider } from "@/context/UIContext";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Daily Asset Brief",
  description:
    "Your personalized morning briefing for stocks, crypto, commodities & more",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sans.variable} ${mono.variable} font-sans bg-zinc-950 text-white antialiased`}
      >
        <ToastProvider>
          <UIProvider>
            <SettingsProvider>
              <PortfolioProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  {/* Main content — offset by sidebar on md+ */}
                  <div className="flex-1 min-w-0 md:ml-16 lg:ml-60">
                    <main className="min-h-screen pb-20 md:pb-8">
                      {children}
                    </main>
                  </div>
                </div>
                <BottomNav />
                <GlobalModals />
                <ToastContainer />
              </PortfolioProvider>
            </SettingsProvider>
          </UIProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
