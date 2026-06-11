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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
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
      if (editingBookmark) {
        // Update existing bookmark
        const { error } = await supabase
          .from("bookmarks")
          .update({
            title: data.title,
            url: data.url,
            is_public: data.is_public,
          })
          .eq("id", editingBookmark.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setMessage({
          type: "success",
          text: "Bookmark updated successfully!",
        });
      } else {
        // Create new bookmark
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          title: data.title,
          url: data.url,
          is_public: data.is_public,
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "Bookmark added successfully!",
        });
      }
      
      // Reset form state
      setEditingBookmark(null);
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

  const handleEditClick = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setFormKey(prev => prev + 1); // Reset form with new initial data
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
    setFormKey(prev => prev + 1);
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    setDeletingId(id);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Bookmark deleted successfully!",
      });
      
      // If we're currently editing this bookmark, cancel it
      if (editingBookmark?.id === id) {
        handleCancelEdit();
      }

      fetchBookmarks(user.id);
    } catch (err) {
      console.error("Error deleting bookmark:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete bookmark";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setDeletingId(null);
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
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm sticky top-8">
            <h2 className="text-lg font-semibold mb-4">
              {editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
            </h2>
            <BookmarkForm 
              initialData={editingBookmark || undefined}
              onSubmit={handleBookmarkSubmit} 
              onCancel={editingBookmark ? handleCancelEdit : undefined}
              isLoading={submitting} 
            />
            
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
                    className={`p-4 border rounded-lg transition-all flex justify-between items-start group ${
                      editingBookmark?.id === bookmark.id
                        ? "border-black bg-gray-50 ring-1 ring-black"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="overflow-hidden flex-1 mr-4">
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
                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bookmark.is_public
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {bookmark.is_public ? "Public" : "Private"}
                      </span>
                      
                      <button
                        onClick={() => handleEditClick(bookmark)}
                        className="p-1 text-gray-400 hover:text-black transition-colors"
                        title="Edit bookmark"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        disabled={deletingId === bookmark.id}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete bookmark"
                      >
                        {deletingId === bookmark.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
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
