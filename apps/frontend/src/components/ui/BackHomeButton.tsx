"use client";

import React from "react";
import Link from "next/link";

export const BackHomeButton: React.FC = () => {
  return (
    <div className="absolute top-6 left-6 z-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-lg active:scale-95"
      >
        <span>←</span>
        <span>Back to Home</span>
      </Link>
    </div>
  );
};
