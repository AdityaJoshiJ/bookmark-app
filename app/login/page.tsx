"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50/50">
      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                fillRule="evenodd"
                d="M6.32 2.577a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.136.643l-3.977-2.313a.75.75 0 0 0-.757 0l-3.977 2.313A.75.75 0 0 1 0 21V3.327a.75.75 0 0 1 .75-.75H6.32Z"
                clipRule="evenodd"
                transform="translate(9, 0)"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-4">
            BookmarkApp
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Save, organize and share your favorite links
          </p>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900 text-center">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 text-center">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 hover:border-slate-300 text-slate-900 placeholder:text-slate-400"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 hover:border-slate-300 text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : "Log In"}
          </button>
        </form>

        {error && (
          <div className="p-4 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="text-sm text-center font-medium text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
