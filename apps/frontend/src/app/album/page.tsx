"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../lib/apiClient";
import { AlbumStats } from "./components/AlbumStats";
import { QuickAddForm } from "./components/QuickAddForm";
import { StickerGrid } from "../../components/album/StickerGrid";

export default function AlbumDashboardPage() {
  const { user, isAuthenticated, isLoading, logout, refreshUserAlbum } = useAuth();
  const router = useRouter();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const triggerAlert = (type: "success" | "error", text: string) => {
    if (type === "success") {
      setSuccessMessage(text);
      setErrorMessage(null);
    } else {
      setErrorMessage(text);
      setSuccessMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4000);
  };

  const handleAddCollected = async (code: string, resetForm: () => void) => {
    setActionLoading("collect");
    try {
      const response = await apiClient.post("/album/collect", { stickerCode: code });
      await refreshUserAlbum();
      triggerAlert("success", response.data.message);
      resetForm();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to add sticker.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddDuplicate = async (code: string, resetForm: () => void) => {
    setActionLoading("duplicate");
    try {
      const response = await apiClient.post("/album/duplicate", { stickerCode: code });
      await refreshUserAlbum();
      triggerAlert("success", response.data.message);
      resetForm();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to add duplicate.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveDuplicate = async (code: string) => {
    setActionLoading(`remove-${code}`);
    try {
      const response = await apiClient.delete("/album/duplicate", { data: { stickerCode: code } });
      await refreshUserAlbum();
      triggerAlert("success", response.data.message);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      triggerAlert("error", axiosError.response?.data?.message || "Failed to remove duplicate.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pb-16 overflow-x-hidden antialiased">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              World Cup 2026 Album
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              Welcome, <strong className="text-white font-medium">{user.name}</strong>
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/50 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20">
              📖 My Album
            </button>
            <Link
              href="/market"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              🤝 Matchmaking Market
            </Link>
            <Link
              href="/trades"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              🔄 Active Trades
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-400 flex items-center gap-2 font-medium">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Top Grid: Progress Stats & Quick Add Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AlbumStats collectedCount={user.collectedStickers.length} duplicateCount={user.duplicateStickers.length} />
          <QuickAddForm onAddCollected={handleAddCollected} onAddDuplicate={handleAddDuplicate} actionLoading={actionLoading} />
        </div>

        {/* Section: Collected Stickers Grid */}
        <StickerGrid
          title="Collected Album"
          icon="🛡️"
          stickers={user.collectedStickers}
          emptyTitle="Your album is currently empty."
          emptySubtitle="Use the Quick Add box above to paste your first sticker code and begin tracking your collection!"
          theme="emerald"
          badgeLabel="CODE"
        />

        {/* Section: Duplicate Inventory Grid */}
        <StickerGrid
          title="Duplicate Inventory (For Trade)"
          icon="🔁"
          stickers={user.duplicateStickers}
          emptyTitle="No duplicates available for trade yet."
          emptySubtitle="Add extra physical copies here so our automated matchmaking engine can pair you with collectors in the market!"
          theme="teal"
          badgeLabel="TRADE"
          onRemoveSticker={handleRemoveDuplicate}
          actionLoading={actionLoading}
        />
      </main>
    </div>
  );
}
