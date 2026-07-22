"use client";

import React from "react";

export interface TradeItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
  };
  offeredStickers: string[];
  requestedStickers: string[];
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

interface TradeCardProps {
  trade: TradeItem;
  currentUserId: string;
  onAccept?: (tradeId: string) => Promise<void>;
  onReject?: (tradeId: string) => Promise<void>;
  onCancel?: (tradeId: string) => Promise<void>;
  actionLoading: string | null;
}

export const TradeCard: React.FC<TradeCardProps> = ({ trade, currentUserId, onAccept, onReject, onCancel, actionLoading }) => {
  const isIncoming = trade.receiver._id === currentUserId;
  const partner = isIncoming ? trade.sender : trade.receiver;
  const isPending = trade.status === "PENDING";

  const getStatusBadge = () => {
    switch (trade.status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 uppercase tracking-wide">
            <span>✅</span>
            <span>Completed Swap</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-bold text-red-300 uppercase tracking-wide">
            <span>❌</span>
            <span>Rejected</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wide">
            <span>🚫</span>
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 uppercase tracking-wide animate-pulse">
            <span>⏳</span>
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-200 backdrop-blur-md shadow-xl flex flex-col justify-between border ${
        isPending && isIncoming
          ? "bg-gradient-to-b from-slate-900/95 to-slate-900/70 border-emerald-500/50 shadow-emerald-500/5"
          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
      }`}
    >
      {/* Header: Partner Info & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-slate-700 flex items-center justify-center font-bold text-white text-base shadow-inner shrink-0">
            {partner.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isIncoming ? "Proposed by" : "Sent to"}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">{partner.name}</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono block">
              {new Date(trade.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Exchange Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 py-2">
        {/* Box 1: What You Give */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block mb-2 flex items-center gap-1.5">
            <span>📤 You Give ({isIncoming ? trade.requestedStickers.length : trade.offeredStickers.length})</span>
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {(isIncoming ? trade.requestedStickers : trade.offeredStickers).map((code) => (
              <span
                key={code}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 font-mono font-bold text-xs border border-teal-500/30 shadow-sm"
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* Box 2: What You Receive */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2 flex items-center gap-1.5">
            <span>📥 You Receive ({isIncoming ? trade.offeredStickers.length : trade.requestedStickers.length})</span>
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {(isIncoming ? trade.offeredStickers : trade.requestedStickers).map((code) => (
              <span
                key={code}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30 shadow-sm"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons (Only visible for active pending trades) */}
      {isPending && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
          {isIncoming ? (
            <>
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(trade._id)}
                  disabled={actionLoading === `reject-${trade._id}`}
                  className="rounded-xl bg-slate-800 hover:bg-red-950/50 hover:text-red-400 border border-slate-700 hover:border-red-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading === `reject-${trade._id}` ? "Decline..." : "Decline"}
                </button>
              )}
              {onAccept && (
                <button
                  type="button"
                  onClick={() => onAccept(trade._id)}
                  disabled={actionLoading === `accept-${trade._id}`}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>🤝</span>
                  <span>{actionLoading === `accept-${trade._id}` ? "Swapping..." : "Accept & Swap"}</span>
                </button>
              )}
            </>
          ) : (
            onCancel && (
              <button
                type="button"
                onClick={() => onCancel(trade._id)}
                disabled={actionLoading === `cancel-${trade._id}`}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading === `cancel-${trade._id}` ? "Cancelling..." : "Cancel Proposal"}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};
