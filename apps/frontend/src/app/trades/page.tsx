"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../lib/apiClient";
import { TradeCard, TradeItem } from "./components/TradeCard";

export default function TradesHubPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUserAlbum } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "history">("incoming");

  const [incomingTrades, setIncomingTrades] = useState<TradeItem[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<TradeItem[]>([]);
  const [historyTrades, setHistoryTrades] = useState<TradeItem[]>([]);

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const triggerAlert = (type: "success" | "error", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialTrades() {
      if (!isAuthenticated) return;
      try {
        if (!isMounted) return;
        const { data } = await apiClient.get("/trades");
        const allTrades: TradeItem[] = data.trades || [];

        const validTrades = allTrades.filter((t) => t && (t.sender || t.senderId) && (t.receiver || t.receiverId));

        const incoming = validTrades.filter((t) => {
          const rawReceiver = t.receiver || t.receiverId;
          const receiverId = typeof rawReceiver === "object" ? rawReceiver?._id : rawReceiver;
          return receiverId === user?._id && t.status?.toUpperCase() === "PENDING";
        });

        const outgoing = validTrades.filter((t) => {
          const rawSender = t.sender || t.senderId;
          const senderId = typeof rawSender === "object" ? rawSender?._id : rawSender;
          return senderId === user?._id && t.status?.toUpperCase() === "PENDING";
        });

        const history = validTrades.filter((t) => t.status?.toUpperCase() !== "PENDING");

        setIncomingTrades(incoming);
        setOutgoingTrades(outgoing);
        setHistoryTrades(history);
      } catch (error: unknown) {
        if (isMounted) {
          console.error("Failed to fetch trades:", error);
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    }

    loadInitialTrades();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?._id]);

  const refreshTradesData = async () => {
    try {
      const { data } = await apiClient.get("/trades");
      const allTrades: TradeItem[] = data.trades || [];

      const validTrades = allTrades.filter((t) => t && (t.sender || t.senderId) && (t.receiver || t.receiverId));

      const incoming = validTrades.filter((t) => {
        const rawReceiver = t.receiver || t.receiverId;
        const receiverId = typeof rawReceiver === "object" ? rawReceiver?._id : rawReceiver;
        return receiverId === user?._id && t.status?.toUpperCase() === "PENDING";
      });

      const outgoing = validTrades.filter((t) => {
        const rawSender = t.sender || t.senderId;
        const senderId = typeof rawSender === "object" ? rawSender?._id : rawSender;
        return senderId === user?._id && t.status?.toUpperCase() === "PENDING";
      });

      const history = validTrades.filter((t) => t.status?.toUpperCase() !== "PENDING");

      setIncomingTrades(incoming);
      setOutgoingTrades(outgoing);
      setHistoryTrades(history);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Failed to refresh trades:", axiosError);
      triggerAlert("error", "Could not refresh trade list.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setDataLoading(true);
    await refreshTradesData();
  };

  const handleAcceptTrade = async (tradeId: string) => {
    setActionLoading(`accept-${tradeId}`);
    try {
      const response = await apiClient.patch(`/trades/${tradeId}`, { status: "accepted" });
      await Promise.all([refreshTradesData(), refreshUserAlbum()]);
      triggerAlert("success", `${response.data.message} Your album has been updated!`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to accept trade.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTrade = async (tradeId: string) => {
    setActionLoading(`reject-${tradeId}`);
    try {
      const response = await apiClient.patch(`/trades/${tradeId}`, { status: "rejected" });
      await refreshTradesData();
      triggerAlert("success", response.data.message || "Trade proposal declined.");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to decline trade.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    setActionLoading(`cancel-${tradeId}`);
    try {
      const response = await apiClient.patch(`/trades/${tradeId}`);
      await refreshTradesData();
      triggerAlert("success", response.data.message || "Proposal cancelled successfully.");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to cancel proposal.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayedTrades = activeTab === "incoming" ? incomingTrades : activeTab === "outgoing" ? outgoingTrades : historyTrades;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pb-16 overflow-x-hidden antialiased">
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Active Trades Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              Welcome, <strong className="text-white font-medium">{user.name}</strong>
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/50 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Link
              href="/album"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              📖 My Album
            </Link>
            <Link
              href="/market"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              🤝 Matchmaking Market
            </Link>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20">
              🔄 Active Trades
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={dataLoading}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/80 transition-all flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>{dataLoading ? "Syncing..." : "Refresh Trades"}</span>
          </button>
        </div>

        {alertMsg && (
          <div
            className={`rounded-xl p-4 text-sm flex items-center gap-2.5 font-medium shadow-lg transition-all ${
              alertMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            <span>{alertMsg.type === "success" ? "✅" : "⚠️"}</span>
            <span>{alertMsg.text}</span>
          </div>
        )}

        <div className="border-b border-slate-800 flex items-center gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 shrink-0 ${
              activeTab === "incoming" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📥 Incoming Proposals</span>
            {incomingTrades.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {incomingTrades.length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 shrink-0 ${
              activeTab === "outgoing" ? "text-teal-400 border-b-2 border-teal-500" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📤 Sent Proposals</span>
            {outgoingTrades.length > 0 && (
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {outgoingTrades.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 shrink-0 ${
              activeTab === "history" ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📜 Past History</span>
          </button>
        </div>

        <div>
          {dataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-56 rounded-2xl bg-slate-900/60 border border-slate-800" />
              ))}
            </div>
          ) : displayedTrades.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20">
              <span className="text-4xl block mb-3">{activeTab === "incoming" ? "📥" : activeTab === "outgoing" ? "📤" : "📜"}</span>
              <h3 className="text-base font-bold text-white">No Trades Found Here</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {activeTab === "incoming"
                  ? "You do not have any pending incoming swap proposals right now. Check out the Matchmaking Market to propose trades to other collectors!"
                  : activeTab === "outgoing"
                    ? "You have not sent any pending trade proposals. Visit the Matchmaking Market to select stickers and initiate a swap."
                    : "Your completed or cancelled trade history is currently empty."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedTrades.map((trade) => (
                <TradeCard
                  key={trade._id}
                  trade={trade}
                  currentUserId={user._id}
                  onAccept={handleAcceptTrade}
                  onReject={handleRejectTrade}
                  onCancel={handleCancelTrade}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
