"use client";
import { useUI } from "@/context/UIContext";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUI();

  return (
    <div
      className={`flex-1 min-w-0 transition-[margin-left] duration-300 ease-in-out ${
        sidebarCollapsed ? "md:ml-0" : "md:ml-16 lg:ml-60"
      }`}
    >
      {/* On desktop with collapsed sidebar, push content below the floating top bar */}
      <main
        className={`min-h-screen pb-20 md:pb-8 transition-[padding-top] duration-300 ease-in-out ${
          sidebarCollapsed ? "md:pt-14" : "md:pt-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
