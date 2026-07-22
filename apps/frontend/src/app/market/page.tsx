"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../lib/apiClient";
import { MatchCard, MatchData } from "./components/MatchCard";
import { CommunityFeedGrid, FeedTrader } from "./components/CommunityFeedGrid";

export default function MarketPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Navigation and UI state
  const [activeTab, setActiveTab] = useState<"matches" | "feed">("matches");
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [submittingTradeId, setSubmittingTradeId] = useState<string | null>(null);

  // Data state
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [feedTraders, setFeedTraders] = useState<FeedTrader[]>([]);

  // Alert notifications
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

    async function loadInitialMarketData() {
      if (!isAuthenticated) return;
      try {
        if (!isMounted) return;

        const { data } = await apiClient.get("/market/matches");
        setMatches(data.matches || []);
      } catch (error: unknown) {
        if (isMounted) {
          console.error("Failed to fetch market data:", error);
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    }

    loadInitialMarketData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const fetchMarketDataForTab = async (tabToFetch: "matches" | "feed") => {
    try {
      if (tabToFetch === "matches") {
        const { data } = await apiClient.get("/market/matches");
        setMatches(data.matches || []);
      } else {
        const { data } = await apiClient.get("/market/feed");
        setFeedTraders(data.feed || []);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Failed to fetch market data:", axiosError);
      triggerAlert("error", "Could not load market data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleTabChange = async (tab: "matches" | "feed") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setDataLoading(true);
    await fetchMarketDataForTab(tab);
  };

  const handleRefresh = async () => {
    setDataLoading(true);
    await fetchMarketDataForTab(activeTab);
  };

  const handleProposeTrade = async (receiverId: string, offered: string[], requested: string[]): Promise<void> => {
    setSubmittingTradeId(receiverId);
    try {
      const response = await apiClient.post("/trades", {
        receiverId,
        offeredStickers: offered,
        requestedStickers: requested,
      });
      triggerAlert("success", `${response.data.message} View it in your Active Trades tab!`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to send trade proposal.");
    } finally {
      setSubmittingTradeId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mutualMatchesCount = matches.filter((m) => m.isMutualMatch).length;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pb-16 overflow-x-hidden antialiased">
      {/* Background Ambient Lighting */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Matchmaking Market
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Link
              href="/album"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              📖 My Album
            </Link>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20">
              🤝 Matchmaking Market
            </button>
            <Link
              href="/trades"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              🔄 Active Trades
            </Link>
          </div>

          <button
            onClick={handleRefresh}
            disabled={dataLoading}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/80 transition-all flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>{dataLoading ? "Scanning..." : "Refresh Market"}</span>
          </button>
        </div>

        {/* Global Notifications */}
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

        {/* Tab Switcher */}
        <div className="border-b border-slate-800 flex items-center gap-8">
          <button
            onClick={() => handleTabChange("matches")}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 ${
              activeTab === "matches" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🎯 Smart Recommendations</span>
            {matches.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {mutualMatchesCount} Perfect
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("feed")}
            className={`pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 ${
              activeTab === "feed" ? "text-teal-400 border-b-2 border-teal-500" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🌍 Community Feed</span>
          </button>
        </div>

        {/* Smart Matchmaking */}
        {activeTab === "matches" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Recommended Trade Partners</h2>
              <p className="text-xs text-slate-400 mt-1">
                Our algorithm scans active albums and sorts collectors by mutual trade potential. Click on any sticker tag to select it for
                an instant proposal.
              </p>
            </div>

            {dataLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20">
                <span className="text-4xl block mb-3">🔍</span>
                <h3 className="text-base font-bold text-white">No Matches Found Right Now</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  We could not find any collectors who currently hold duplicate stickers that are missing from your album. Check back soon
                  as new collectors join!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <MatchCard
                    key={match.userId}
                    match={match}
                    onProposeTrade={handleProposeTrade}
                    isSubmitting={submittingTradeId === match.userId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Community Feed */}
        {activeTab === "feed" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Public Collector Directory</h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore the complete list of collectors currently offering duplicate stickers on the platform.
              </p>
            </div>

            <CommunityFeedGrid traders={feedTraders} isLoading={dataLoading} />
          </div>
        )}
      </main>
    </div>
  );
}
