import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const supabase = await createSupabaseServerClient();

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white p-8 sm:p-12 border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-10 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 rounded-full transition-transform group-hover:scale-110 duration-700"></div>
          
          <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 flex items-center justify-center mb-6 transform transition-transform group-hover:rotate-12">
              <span className="text-3xl font-black text-white">
                {profile.handle[0].toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2">
              @{profile.handle}
            </h1>
            
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200/50 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-600">
                {bookmarks?.length || 0} public {bookmarks?.length === 1 ? 'bookmark' : 'bookmarks'}
              </span>
            </div>

            <Link
              href="/signup"
              className="px-8 py-4 text-base font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
            >
              Create Your Own Profile
            </Link>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid gap-4 sm:gap-6">
          {!bookmarks || bookmarks.length === 0 ? (
            <div className="bg-white p-20 text-center border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-slate-400">No public bookmarks shared yet.</p>
            </div>
          ) : (
            bookmarks.map((bookmark: Bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white p-6 sm:p-8 border border-slate-100 rounded-[2rem] shadow-lg shadow-slate-200/30 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div className="overflow-hidden flex-1 pr-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate mb-2">
                      {bookmark.title}
                    </h2>
                    <div className="flex items-center text-slate-400 group-hover:text-slate-500 transition-colors font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="truncate text-sm">
                        {new URL(bookmark.url).hostname}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0 border border-slate-100 group-hover:border-indigo-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Premium Footer */}
        <footer className="mt-16 text-center border-t border-slate-200 pt-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                <path fillRule="evenodd" d="M6.32 2.577a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.136.643l-3.977-2.313a.75.75 0 0 0-.757 0l-3.977 2.313A.75.75 0 0 1 0 21V3.327a.75.75 0 0 1 .75-.75H6.32Z" clipRule="evenodd" transform="translate(9, 0)" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">BookmarkApp</span>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Organize your digital universe</p>
        </footer>
      </div>
    </div>
  );
}
