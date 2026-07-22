"use client";

import React from "react";

export interface FeedTrader {
  userId: string;
  name: string;
  totalDuplicates: number;
  availableStickers: string[];
}

interface CommunityFeedGridProps {
  traders: FeedTrader[];
  isLoading: boolean;
}

export const CommunityFeedGrid: React.FC<CommunityFeedGridProps> = ({ traders, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800" />
        ))}
      </div>
    );
  }

  if (traders.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20">
        <span className="text-4xl block mb-3">🌍</span>
        <h3 className="text-base font-bold text-white">No Active Traders Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          As soon as collectors add duplicate stickers to their inventory, they will appear publicly on this live feed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {traders.map((trader) => (
        <div
          key={trader.userId}
          className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500/20 to-blue-500/20 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                {trader.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-white text-sm">{trader.name}</span>
            </div>
            <span className="text-[11px] font-semibold bg-slate-800 text-teal-300 px-2.5 py-1 rounded-full border border-slate-700">
              {trader.totalDuplicates} Duplicates
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Available Inventory</span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {trader.availableStickers.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700/60"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
