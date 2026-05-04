"use client";
import MarketStatus from "@/components/MarketStatus";
import { useUI } from "@/context/UIContext";
import { BarChart2, Briefcase, Newspaper, PanelLeftOpen, Search, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Brief", icon: Zap },
  { href: "/market", label: "Market", icon: BarChart2 },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/news", label: "News", icon: Newspaper },
];

export default function FloatingTopBar() {
  const pathname = usePathname();
  const { openSearch, toggleSidebar, sidebarCollapsed } = useUI();

  return (
    <div
      className={`hidden md:flex fixed top-2 left-1/2 -translate-x-1/2 z-40 items-center gap-0.5 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/40 rounded-2xl shadow-2xl shadow-black/40 px-2 py-1.5 transition-all duration-300 ease-in-out ${
        sidebarCollapsed
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
      aria-hidden={!sidebarCollapsed}
    >
      {/* Brand mark */}
      <div className="flex items-center px-1.5 mr-0.5">
        <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" fill="currentColor" />
        </div>
      </div>

      <div className="w-px h-4 bg-zinc-700/60 mx-1" />

      {/* Nav items */}
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            tabIndex={sidebarCollapsed ? 0 : -1}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
              active
                ? "bg-blue-600/20 text-blue-400"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="w-px h-4 bg-zinc-700/60 mx-1" />

      {/* Actions */}
      <MarketStatus showLabel={false} />

      <button
        onClick={openSearch}
        tabIndex={sidebarCollapsed ? 0 : -1}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
        title="Search assets (⌘K)"
        aria-label="Search assets"
      >
        <Search className="w-3.5 h-3.5" />
      </button>

      <Link
        href="/settings"
        tabIndex={sidebarCollapsed ? 0 : -1}
        className={`p-1.5 rounded-lg transition-colors ${
          pathname === "/settings"
            ? "text-blue-400 bg-blue-600/20"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
        }`}
        title="Settings"
        aria-label="Settings"
      >
        <Settings className="w-3.5 h-3.5" />
      </Link>

      <div className="w-px h-4 bg-zinc-700/60 mx-1" />

      {/* Expand sidebar */}
      <button
        onClick={toggleSidebar}
        tabIndex={sidebarCollapsed ? 0 : -1}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
        title="Expand sidebar"
        aria-label="Expand sidebar"
      >
        <PanelLeftOpen className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
