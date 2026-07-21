"use client";

import React from "react";

interface StickerGridProps {
  title: string;
  icon: string;
  stickers: string[];
  emptyTitle: string;
  emptySubtitle: string;
  theme: "emerald" | "teal";
  badgeLabel: string;
  onRemoveSticker?: (code: string) => void;
  actionLoading?: string | null;
}

export const StickerGrid: React.FC<StickerGridProps> = ({
  title,
  icon,
  stickers,
  emptyTitle,
  emptySubtitle,
  theme,
  badgeLabel,
  onRemoveSticker,
  actionLoading,
}) => {
  const isEmerald = theme === "emerald";

  return (
    <section className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <span>{title}</span>
        </h2>
        <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          {stickers.length} {stickers.length === 1 ? "Sticker" : "Stickers"}
        </span>
      </div>

      {stickers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
          <p className="text-slate-400 text-sm font-medium">{emptyTitle}</p>
          <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {stickers.map((code, idx) => (
            <div
              key={`${code}-${idx}`}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 shadow-lg transition-all duration-200 ${
                isEmerald ? "hover:border-emerald-500/50 hover:shadow-emerald-500/10" : "hover:border-teal-500/50 hover:shadow-teal-500/10"
              }`}
            >
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{badgeLabel}</span>
              <span className={`text-base font-black tracking-wider mt-0.5 ${isEmerald ? "text-emerald-400" : "text-teal-400"}`}>
                {code}
              </span>

              {/* Conditional removal button for duplicate inventory */}
              {onRemoveSticker && (
                <button
                  onClick={() => onRemoveSticker(code)}
                  disabled={actionLoading === `remove-${code}`}
                  title="Remove 1 copy"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-900/90 hover:bg-red-600 border border-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md active:scale-90 disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
