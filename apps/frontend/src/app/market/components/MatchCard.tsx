"use client";

import React, { useState } from "react";

export interface MatchData {
  userId: string;
  name: string;
  email: string;
  stickersWeNeed: string[];
  stickersTheyNeedFromUs: string[];
  isMutualMatch: boolean;
}

interface MatchCardProps {
  match: MatchData;
  onProposeTrade: (receiverId: string, offered: string[], requested: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onProposeTrade, isSubmitting }) => {
  // Local state to select one sticker to offer and one to request for a clean 1-for-1 trade
  const [selectedOffered, setSelectedOffered] = useState<string>(match.stickersTheyNeedFromUs[0] || "");
  const [selectedRequested, setSelectedRequested] = useState<string>(match.stickersWeNeed[0] || "");

  const handleTradeClick = () => {
    if (!selectedRequested) return;

    // If it's a mutual match, send the selected offered sticker. Otherwise, send an empty array or let user know.
    const offeredArray = selectedOffered ? [selectedOffered] : [];
    const requestedArray = [selectedRequested];

    onProposeTrade(match.userId, offeredArray, requestedArray);
  };

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 backdrop-blur-md shadow-xl flex flex-col justify-between ${
        match.isMutualMatch
          ? "bg-gradient-to-b from-slate-900/90 to-slate-900/60 border-2 border-emerald-500/60 shadow-emerald-500/10"
          : "bg-slate-900/60 border border-slate-800/80 hover:border-slate-700"
      }`}
    >
      {/* Top Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base shadow-inner">
            {match.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{match.name}</h3>
            <span className="text-xs text-slate-400 block font-mono">{match.email}</span>
          </div>
        </div>

        {match.isMutualMatch ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-extrabold text-emerald-300 tracking-wide uppercase shadow-sm">
            <span>🥇</span>
            <span>Perfect Match</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-400">
            <span>🥈</span>
            <span>One-Way Trade</span>
          </span>
        )}
      </div>

      {/* Inventory Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 py-4 border-y border-slate-800/80">
        {/* Column 1: What they have that we need */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
            Stickers You Need ({match.stickersWeNeed.length})
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {match.stickersWeNeed.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedRequested(code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedRequested === code
                    ? "bg-emerald-500 text-slate-950 shadow-md scale-105"
                    : "bg-slate-800/80 text-emerald-300 border border-emerald-500/30 hover:bg-slate-700"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: What we have that they need */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block mb-2">
            Stickers They Want ({match.stickersTheyNeedFromUs.length})
          </span>
          {match.stickersTheyNeedFromUs.length === 0 ? (
            <p className="text-xs text-slate-500 italic mt-2">You do not own any duplicates this user is missing.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {match.stickersTheyNeedFromUs.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedOffered(code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedOffered === code
                      ? "bg-teal-400 text-slate-950 shadow-md scale-105"
                      : "bg-slate-800/80 text-teal-300 border border-teal-500/30 hover:bg-slate-700"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-2 flex items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 truncate">
          {selectedRequested && selectedOffered ? (
            <span>
              Swap <strong className="text-teal-400 font-mono">{selectedOffered}</strong> for{" "}
              <strong className="text-emerald-400 font-mono">{selectedRequested}</strong>
            </span>
          ) : selectedRequested ? (
            <span>
              Requesting <strong className="text-emerald-400 font-mono">{selectedRequested}</strong>
            </span>
          ) : (
            <span className="italic text-slate-500">Select stickers above</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleTradeClick}
          disabled={isSubmitting || !selectedRequested || (match.isMutualMatch && !selectedOffered)}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <span>🤝</span>
          <span>Propose Trade</span>
        </button>
      </div>
    </div>
  );
};
