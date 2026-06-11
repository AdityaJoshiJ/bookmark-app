"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      // options: {
      //   emailRedirectTo: `${window.location.origin}/auth/callback`,
      // },
    });

    if (error) {
      setMessage({
        type: "error",
        text: `${error.status ?? ""} ${error.message}`,
      });
    } else {
      setMessage({
        type: "success",
        text: "Check your email for the confirmation link!",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Create an Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {message && (
          <div
            className={`p-4 text-sm rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
