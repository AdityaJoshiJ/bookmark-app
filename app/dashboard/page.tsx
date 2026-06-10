"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookmarkForm } from "@/components/BookmarkForm";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleBookmarkSubmit = async (data: { title: string; url: string; is_public: boolean }) => {
    if (!user) return;
    
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        title: data.title,
        url: data.url,
        is_public: data.is_public,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: "Bookmark added successfully!",
      });
    } catch (err) {
      console.error("Error adding bookmark:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add bookmark";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-2">User Profile</h2>
            <p className="text-gray-600">
              Logged in as: <span className="font-semibold text-black">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add New Bookmark</h2>
            <BookmarkForm onSubmit={handleBookmarkSubmit} isLoading={submitting} />
            
            {message && (
              <div
                className={`mt-4 p-4 text-sm rounded-lg border ${
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
      </div>
    </div>
  );
}
