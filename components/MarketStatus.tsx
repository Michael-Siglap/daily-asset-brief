"use client";
import { useEffect, useState } from "react";

function checkMarketOpen(): boolean {
  const now = new Date();
  // Determine US Eastern offset (EDT = UTC-4, EST = UTC-5)
  const month = now.getUTCMonth() + 1;
  const etOffsetHours = month >= 3 && month <= 11 ? -4 : -5;
  const et = new Date(now.getTime() + etOffsetHours * 3_600_000);
  const day = et.getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const mins = et.getUTCHours() * 60 + et.getUTCMinutes();
  return mins >= 570 && mins < 960; // 9:30 AM – 4:00 PM ET
}

interface Props {
  showLabel?: boolean;
}

export default function MarketStatus({ showLabel = true }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(checkMarketOpen());
    const interval = setInterval(() => setOpen(checkMarketOpen()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-2 py-2" title={open ? "US markets are open" : "US markets are closed"}>
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${open ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`}
      />
      {showLabel && (
        <span className={`text-xs font-medium ${open ? "text-emerald-400" : "text-zinc-500"}`}>
          {open ? "Market Open" : "Market Closed"}
        </span>
      )}
    </div>
  );
}
