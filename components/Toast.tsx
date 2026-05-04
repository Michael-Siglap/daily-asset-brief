"use client";
import { useToast } from "@/context/ToastContext";

const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: "bg-emerald-950/90 border-emerald-500/30 text-emerald-300",
  error: "bg-red-950/90 border-red-500/30 text-red-300",
  info: "bg-zinc-900/90 border-zinc-700/60 text-zinc-200",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm font-medium pointer-events-auto animate-toast-in text-left w-72 max-w-full ${STYLES[t.type]}`}
        >
          {ICONS[t.type]}
          <span className="flex-1">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
