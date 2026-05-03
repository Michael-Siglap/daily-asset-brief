"use client";
import { formatDistanceToNow } from "date-fns";
import type { NewsItem } from "@/lib/types";

interface Props {
  item: NewsItem;
}

export default function NewsCard({ item }: Props) {
  const ago = (() => {
    try {
      return formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors"
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-zinc-800"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-snug line-clamp-3">{item.title}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-zinc-500">{item.publisher}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500">{ago}</span>
          {item.relatedSymbols.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5">{s}</span>
          ))}
        </div>
      </div>
    </a>
  );
}
