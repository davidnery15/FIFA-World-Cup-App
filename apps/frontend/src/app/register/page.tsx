"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { BackHomeButton } from "@/components/ui/BackHomeButton";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Full name must contain at least 2 characters." })
    .max(50, { message: "Full name cannot exceed 50 characters." }),
  email: z.email({ message: "Please enter a valid email address." }).min(1, { message: "Email address is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password exceeds maximum length." }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await authRegister(data.name, data.email, data.password);
      router.push("/album");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || "Registration failed. Please try again later.";
      setApiError(message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden antialiased">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <BackHomeButton />

      {/* Glass morphic card container */}
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 border border-slate-800 shadow-2xl shadow-black/50">
        {/* Header section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-slate-700/60 rounded-2xl flex items-center justify-center shadow-inner mb-6">
            <span className="text-3xl select-none">🏆</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Create your Account</h2>
          <p className="mt-2 text-sm text-slate-400 font-normal leading-relaxed max-w-sm">
            Join the global collector community and start filling your World Cup album today.
          </p>
        </div>

        {/* Global API error alert banner */}
        {apiError && (
          <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 text-center flex items-center justify-center gap-2">
            <span className="font-semibold">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Registration form */}
        <form className="mt-8 flex flex-col gap-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full Name input field */}
          <div className="flex flex-col gap-y-2">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="David Nery"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>}
          </div>

          {/* Email input field */}
          <div className="flex flex-col gap-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="collector@example.com"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-y-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-400 font-medium">{errors.password.message}</p>}
          </div>

          {/* Submit action button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99]"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Navigation footer */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
