"use client";
import { BarChart2, Briefcase, Newspaper, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Brief", icon: Zap },
  { href: "/market", label: "Market", icon: BarChart2 },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/news", label: "News", icon: Newspaper },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/60 pb-safe">
      <div className="flex">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
                active ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
