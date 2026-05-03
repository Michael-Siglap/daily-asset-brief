"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Brief", icon: "⚡" },
  { href: "/market", label: "Market", icon: "📊" },
  { href: "/portfolio", label: "Portfolio", icon: "💼" },
  { href: "/news", label: "News", icon: "📰" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 pb-safe">
      <div className="flex max-w-lg mx-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
                active ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
