"use client";

import React from "react";

interface AlbumStatsProps {
  collectedCount: number;
  duplicateCount: number;
  totalStickers?: number;
}

export const AlbumStats: React.FC<AlbumStatsProps> = ({ collectedCount, duplicateCount, totalStickers = 600 }) => {
  const progressPercentage = Math.min((collectedCount / totalStickers) * 100, 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
      {/* Unique Collection Progress */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unique Collection</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {collectedCount} <span className="text-sm font-normal text-slate-500">stickers</span>
          </h3>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Album Completion</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Available Duplicates */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Duplicates</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {duplicateCount} <span className="text-sm font-normal text-slate-500">for trade</span>
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-6 leading-relaxed">
          These stickers are publicly visible in the Matchmaking Market, allowing other collectors to propose trades with you.
        </p>
      </div>
    </div>
  );
};
