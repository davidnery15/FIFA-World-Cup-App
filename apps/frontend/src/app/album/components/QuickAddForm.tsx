"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const stickerSchema = z.object({
  stickerCode: z
    .string()
    .min(3, { message: "Code must be at least 3 characters (e.g., ARG-1)." })
    .max(10, { message: "Code is too long." })
    .trim()
    .toUpperCase(),
});

type StickerFormData = z.infer<typeof stickerSchema>;

interface QuickAddFormProps {
  onAddCollected: (code: string, resetForm: () => void) => Promise<void>;
  onAddDuplicate: (code: string, resetForm: () => void) => Promise<void>;
  actionLoading: string | null;
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ onAddCollected, onAddDuplicate, actionLoading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StickerFormData>({
    resolver: zodResolver(stickerSchema),
  });

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Add Sticker</span>
        <p className="text-xs text-slate-500 mt-1">Type the code printed on your physical sticker.</p>
      </div>

      <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
        <div>
          <input
            type="text"
            placeholder="e.g., ARG-10, ESP-1"
            className="w-full rounded-xl bg-slate-950/60 border border-slate-700/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 uppercase focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            {...register("stickerCode")}
          />
          {errors.stickerCode && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.stickerCode.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleSubmit((data) => onAddCollected(data.stickerCode, reset))}
            disabled={!!actionLoading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-3 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            {actionLoading === "collect" ? "Saving..." : "+ To Album"}
          </button>

          <button
            type="button"
            onClick={handleSubmit((data) => onAddDuplicate(data.stickerCode, reset))}
            disabled={!!actionLoading}
            className="w-full rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 py-2.5 px-3 text-xs font-semibold text-slate-200 shadow-sm disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
          >
            {actionLoading === "duplicate" ? "Saving..." : "+ Duplicate"}
          </button>
        </div>
      </form>
    </div>
  );
};
