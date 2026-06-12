"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookmarkForm } from "@/components/BookmarkForm";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { User } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
}

interface Profile {
  handle: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [fetchingBookmarks, setFetchingBookmarks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
  
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [handleLoading, setHandleLoading] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  const handleChanged = useMemo(() => {
    return newHandle.trim() !== (profile?.handle ?? "");
  }, [newHandle, profile]);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("handle")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      if (data?.handle) setNewHandle(data.handle);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        await Promise.all([
          fetchProfile(user.id),
          fetchBookmarks(user.id)
        ]);
      }
      setLoading(false);
    };

    checkUser();
  }, [router, fetchBookmarks, fetchProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const validateHandle = (handle: string) => {
    if (handle.length < 3 || handle.length > 20) {
      return "Handle must be between 3 and 20 characters";
    }
    if (!/^[a-z0-9_]+$/.test(handle)) {
      return "Handle can only contain lowercase letters, numbers, and underscores";
    }
    return null;
  };

  const handleSaveHandle = async () => {
    if (!user || !handleChanged) return;
    
    const error = validateHandle(newHandle);
    if (error) {
      setHandleError(error);
      return;
    }

    setHandleLoading(true);
    setHandleError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ handle: newHandle })
        .eq("id", user.id);

      if (updateError) {
        if (updateError.code === "23505") {
          throw new Error("This handle is already taken");
        }
        throw updateError;
      }

      setProfile({ handle: newHandle });
      setIsEditingHandle(false);
      setMessage({ type: "success", text: "Handle updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setHandleError(err instanceof Error ? err.message : "Failed to update handle");
    } finally {
      setHandleLoading(false);
    }
  };

  const handleBookmarkSubmit = async (data: {
    title: string;
    url: string;
    is_public: boolean;
  }) => {
    if (!user) return;

    setSubmitting(true);
    setMessage(null);

    try {
      if (editingBookmark) {
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

      setEditingBookmark(null);
      setFormKey((prev) => prev + 1);
      fetchBookmarks(user.id);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error saving bookmark:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save bookmark";
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
    setFormKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
    setFormKey((prev) => prev + 1);
  };

  const handleDeleteBookmark = async () => {
    if (!user || !bookmarkToDelete) return;

    const id = bookmarkToDelete.id;
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

      if (editingBookmark?.id === id) {
        handleCancelEdit();
      }

      fetchBookmarks(user.id);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting bookmark:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete bookmark";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setDeletingId(null);
      setBookmarkToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-slate-100 pb-12">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path fillRule="evenodd" d="M6.32 2.577a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.136.643l-3.977-2.313a.75.75 0 0 0-.757 0l-3.977 2.313A.75.75 0 0 1 0 21V3.327a.75.75 0 0 1 .75-.75H6.32Z" clipRule="evenodd" transform="translate(9, 0)" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                BookmarkApp
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-slate-900 leading-none">
                  {profile?.handle ? `@${profile.handle}` : "No handle set"}
                </span>
                <span className="text-xs font-semibold text-slate-500 mt-1">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
              <div className="relative">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                  Your Profile
                </h2>
                
                {isEditingHandle ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                      <input
                        type="text"
                        value={newHandle}
                        onChange={(e) => setNewHandle(e.target.value.toLowerCase())}
                        placeholder="your_handle"
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-black font-semibold"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveHandle}
                        disabled={handleLoading || !handleChanged}
                        className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                      >
                        {handleLoading ? "Saving..." : "Save Handle"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingHandle(false);
                          setNewHandle(profile?.handle || "");
                          setHandleError(null);
                        }}
                        className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                    {handleError && <p className="text-xs font-bold text-rose-600 mt-1">{handleError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group/handle shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Public Handle</span>
                      <span className="text-lg font-bold text-slate-900">
                        {profile?.handle ? `@${profile.handle}` : "Set a handle"}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditingHandle(true)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit handle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {profile?.handle && (
                  <div className="mt-4">
                    <a 
                      href={`/${profile.handle}`} 
                      target="_blank" 
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-100/50 hover:border-indigo-200 transition-all gap-2"
                    >
                      View Public Profile
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bookmark Form Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-3"></span>
                {editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
              </h2>
              <BookmarkForm
                key={formKey}
                initialData={editingBookmark || undefined}
                onSubmit={handleBookmarkSubmit}
                onCancel={editingBookmark ? handleCancelEdit : undefined}
                isLoading={submitting}
              />

              {message && (
                <div
                  className={`mt-6 p-4 text-sm font-bold rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200 ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  {message.type === "success" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4.006-5.5z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  )}
                  {message.text}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[600px]">
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Bookmarks</h2>
                  <p className="text-slate-500 text-sm font-bold mt-1">
                    Manage and organize your collection
                  </p>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center space-x-2">
                  <span className="text-sm font-extrabold text-slate-600">{bookmarks.length}</span>
                  {fetchingBookmarks && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-500 border-t-transparent"></div>
                  )}
                </div>
              </div>

              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg shadow-slate-200/50 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No bookmarks yet</h3>
                  <p className="text-slate-500 text-center max-w-xs font-bold">
                    Start by adding your favorite links using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`group p-5 bg-white border rounded-2xl transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 ${
                        editingBookmark?.id === bookmark.id
                          ? "border-indigo-500 bg-indigo-50/10 ring-4 ring-indigo-500/5"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="overflow-hidden flex-1 w-full sm:w-auto">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate text-lg">
                            {bookmark.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md shrink-0 ${
                              bookmark.is_public
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {bookmark.is_public ? "Public" : "Private"}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-500 group-hover:text-slate-700 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-indigo-600 hover:underline truncate block"
                          >
                            {bookmark.url.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          onClick={() => handleEditClick(bookmark)}
                          className="flex-1 sm:flex-none p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                          title="Edit bookmark"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setBookmarkToDelete(bookmark)}
                          disabled={deletingId === bookmark.id}
                          className="flex-1 sm:flex-none p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 disabled:opacity-50 shadow-sm"
                          title="Delete bookmark"
                        >
                          {deletingId === bookmark.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 mx-auto border-2 border-rose-600 border-t-transparent"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      </main>

      <DeleteConfirmModal
        isOpen={!!bookmarkToDelete}
        title="Delete Bookmark"
        message="Are you sure you want to delete this bookmark? This action cannot be undone."
        isLoading={!!deletingId}
        onConfirm={handleDeleteBookmark}
        onCancel={() => setBookmarkToDelete(null)}
      />
    </div>
  );
}
