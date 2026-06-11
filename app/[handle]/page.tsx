import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;

  // 1. Fetch Profile by handle
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("handle", handle)
    .maybeSingle();

  if (profileError) {
    throw new Error("Failed to fetch profile");
  }

  // If handle doesn't exist, show 404
  if (!profile || !profile.handle) {
    notFound();
  }

  // 2. Fetch Public Bookmarks for this profile
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("id, title, url, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (bookmarksError) {
    throw new Error("Failed to fetch bookmarks");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-sm mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">@{profile.handle}</h1>
            <p className="text-gray-500 mt-1">
              {bookmarks?.length || 0} public {bookmarks?.length === 1 ? 'bookmark' : 'bookmarks'}
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors inline-block"
          >
            Create Your Own
          </Link>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-4">
          {!bookmarks || bookmarks.length === 0 ? (
            <div className="bg-white p-12 text-center border border-gray-200 rounded-2xl shadow-sm">
              <p className="text-gray-400">No public bookmarks shared yet.</p>
            </div>
          ) : (
            bookmarks.map((bookmark: Bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:border-black transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {bookmark.title}
                    </h2>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {new URL(bookmark.url).hostname}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Powered by BookmarkApp</p>
        </footer>
      </div>
    </div>
  );
}
