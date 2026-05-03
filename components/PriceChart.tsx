"use client";
import type { HistoricalBar } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  symbol: string;
  isDark?: boolean;
}

const RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y"] as const;
type Range = (typeof RANGES)[number];

export default function PriceChart({ symbol, isDark = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<Range>("1mo");
  const [bars, setBars] = useState<HistoricalBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "candle">("line");

  // Fetch data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then((r) => r.json())
      .then((data) => setBars(Array.isArray(data) ? data : []))
      .catch(() => setBars([]))
      .finally(() => setLoading(false));
  }, [symbol, range]);

  // Build/update chart
  useEffect(() => {
    if (!containerRef.current || bars.length === 0 || loading) return;

    let chart: import("lightweight-charts").IChartApi | null = null;
    let destroyed = false;

    import("lightweight-charts").then(
      ({
        createChart,
        ColorType,
        LineStyle,
        AreaSeries,
        CandlestickSeries,
      }) => {
        if (destroyed || !containerRef.current) return;

        const bg = isDark ? "#09090b" : "#ffffff";
        const textColor = isDark ? "#a1a1aa" : "#52525b";
        const borderColor = isDark ? "#27272a" : "#e4e4e7";
        const upColor = "#10b981";
        const downColor = "#ef4444";

        chart = createChart(containerRef.current!, {
          width: containerRef.current!.offsetWidth,
          height: 200,
          layout: {
            background: { type: ColorType.Solid, color: bg },
            textColor,
          },
          grid: {
            vertLines: { color: borderColor, style: LineStyle.Dotted },
            horzLines: { color: borderColor, style: LineStyle.Dotted },
          },
          rightPriceScale: { borderColor },
          timeScale: { borderColor, timeVisible: true, secondsVisible: false },
          crosshair: { mode: 1 },
          handleScroll: true,
          handleScale: true,
        });

        if (chartType === "line") {
          const firstClose = bars[0]?.close ?? 0;
          const lastClose = bars[bars.length - 1]?.close ?? 0;
          const isUp = lastClose >= firstClose;
          const lineColor = isUp ? upColor : downColor;

          const series = chart.addSeries(AreaSeries, {
            lineColor,
            topColor: lineColor + "33",
            bottomColor: lineColor + "05",
            lineWidth: 2,
          });
          series.setData(
            bars.map((b) => ({
              time: b.time as import("lightweight-charts").UTCTimestamp,
              value: b.close,
            })),
          );
        } else {
          const series = chart.addSeries(CandlestickSeries, {
            upColor,
            downColor,
            borderUpColor: upColor,
            borderDownColor: downColor,
            wickUpColor: upColor,
            wickDownColor: downColor,
          });
          series.setData(
            bars.map((b) => ({
              time: b.time as import("lightweight-charts").UTCTimestamp,
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close,
            })),
          );
        }

        chart.timeScale().fitContent();

        // Responsive resize
        const ro = new ResizeObserver(() => {
          if (chart && containerRef.current) {
            chart.resize(containerRef.current.offsetWidth, 200);
          }
        });
        if (containerRef.current) ro.observe(containerRef.current);

        return () => ro.disconnect();
      },
    );

    return () => {
      destroyed = true;
      chart?.remove();
    };
  }, [bars, loading, isDark, chartType]);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                range === r
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-300"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setChartType((t) => (t === "line" ? "candle" : "line"))
          }
          className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-300 text-xs px-2 py-0.5 rounded transition-colors"
        >
          {chartType === "line" ? "Candles" : "Line"}
        </button>
      </div>

      {/* Chart container */}
      {loading ? (
        <div className="h-[200px] bg-zinc-900 dark:bg-zinc-900 rounded-lg animate-pulse" />
      ) : bars.length === 0 ? (
        <div className="h-[200px] bg-zinc-900 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 text-sm">
          No chart data
        </div>
      ) : (
        <div
          ref={containerRef}
          className="rounded-lg overflow-hidden"
          style={{ height: 200 }}
        />
      )}
    </div>
  );
}
