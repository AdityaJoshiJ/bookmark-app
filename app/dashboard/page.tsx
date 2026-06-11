"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookmarkForm } from "@/components/BookmarkForm";
import { User } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [fetchingBookmarks, setFetchingBookmarks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  const fetchBookmarks = useCallback(async (userId: string) => {
    setFetchingBookmarks(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setFetchingBookmarks(false);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchBookmarks(user.id);
      }
      setLoading(false);
    };

    checkUser();
  }, [router, fetchBookmarks]);

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
      
      // Reset form and refresh list
      setFormKey(prev => prev + 1);
      fetchBookmarks(user.id);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600 text-sm">Welcome back, {user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Add New Bookmark</h2>
            <BookmarkForm key={formKey} onSubmit={handleBookmarkSubmit} isLoading={submitting} />
            
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

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Your Bookmarks</h2>
              {fetchingBookmarks && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              )}
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400">No bookmarks yet. Add your first one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all flex justify-between items-start"
                  >
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {bookmark.title}
                      </h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate block"
                      >
                        {bookmark.url}
                      </a>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        bookmark.is_public
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {bookmark.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
