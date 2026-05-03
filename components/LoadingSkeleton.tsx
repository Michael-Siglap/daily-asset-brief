export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
          <div className="h-3 w-24 bg-zinc-800 rounded" />
        </div>
        <div className="text-right">
          <div className="h-4 w-20 bg-zinc-800 rounded mb-1" />
          <div className="h-3 w-12 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-zinc-800 rounded" />
        <div>
          <div className="h-3.5 w-14 bg-zinc-800 rounded mb-1" />
          <div className="h-3 w-20 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="text-right">
        <div className="h-3.5 w-16 bg-zinc-800 rounded mb-1" />
        <div className="h-3 w-10 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

export function SkeletonNews() {
  return (
    <div className="flex gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse">
      <div className="w-16 h-16 bg-zinc-800 rounded-lg shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 bg-zinc-800 rounded w-full mb-1.5" />
        <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
  );
}
