"use client";
import MarketStatus from "@/components/MarketStatus";
import { useUI } from "@/context/UIContext";
import { BarChart2, Briefcase, Newspaper, PanelLeftClose, Search, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Brief", icon: Zap },
  { href: "/market", label: "Market", icon: BarChart2 },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/news", label: "News", icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { openSearch, sidebarCollapsed, toggleSidebar } = useUI();

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-full z-40 flex-col bg-zinc-950 border-r border-zinc-800/60 w-16 lg:w-60 transition-transform duration-300 ease-in-out ${
        sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
      }`}
      aria-hidden={sidebarCollapsed}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="font-bold text-white text-sm leading-tight">Daily Brief</p>
            <p className="text-zinc-500 text-xs">Asset Dashboard</p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          tabIndex={sidebarCollapsed ? -1 : 0}
          className="hidden lg:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors shrink-0"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-zinc-800/40">
        <button
          onClick={openSearch}
          tabIndex={sidebarCollapsed ? -1 : 0}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors group"
          title="Search assets (⌘K)"
          aria-label="Search assets"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="hidden lg:flex flex-1 items-center justify-between text-sm">
            <span>Search assets…</span>
            <kbd className="text-xs bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </span>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={sidebarCollapsed ? -1 : 0}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
              {active && <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-zinc-800/40 pt-3 space-y-0.5">
        <div className="hidden lg:block">
          <MarketStatus />
        </div>
        <div className="lg:hidden">
          <MarketStatus showLabel={false} />
        </div>
        <Link
          href="/settings"
          tabIndex={sidebarCollapsed ? -1 : 0}
          className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
            pathname === "/settings"
              ? "bg-blue-600/15 text-blue-400"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
          }`}
          title="Settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block text-sm font-medium">Settings</span>
        </Link>

        {/* Collapse button at md (icon-only) breakpoint */}
        <button
          onClick={toggleSidebar}
          tabIndex={sidebarCollapsed ? -1 : 0}
          className="lg:hidden w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
