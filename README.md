# Bookmark App

A small personal bookmarks application built with Next.js, TypeScript, Supabase, and Resend.

Think of it as a lightweight combination of Linktree and Pocket — users can save bookmarks privately, share selected bookmarks publicly, and create a public profile using a unique handle.

## Features

### Authentication

* Sign up with email and password
* Log in with email and password
* Protected dashboard for authenticated users
* Email verification handled by Supabase
* Welcome email sent using Resend

### Bookmark Management

* Create bookmarks
* Edit bookmarks
* Delete bookmarks
* Mark bookmarks as public or private

### Public Profiles

* Unique handle for each user
* Public profile available at `/[handle]`
* Only public bookmarks are displayed
* Private bookmarks remain hidden

### Security

* Supabase Row Level Security (RLS)
* Users can only create, edit, view, and delete their own bookmarks
* Public users can only view bookmarks marked as public

## Tech Stack

* Next.js (App Router)
* TypeScript
* Supabase (Authentication + Database)
* Resend (Email)
* Tailwind CSS
* Vercel (Deployment)

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/AdityaJoshiJ/bookmark-app.git
cd bookmark-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Start development server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:3000
```

## AI Agent Mistakes and Corrections

While building the project, I used an AI coding agent extensively and corrected several issues it introduced.

* The AI generated bookmark insertion logic that failed due to missing Supabase Row Level Security policies. I investigated the `42501` permission error, created the appropriate RLS policies, and verified that users could only access their own data.
* The AI implemented bookmark editing, but the form appeared empty when entering edit mode. After debugging state updates and component lifecycle behavior, I discovered the issue was related to UI visibility rather than state management and corrected the form behavior.
* The AI assumed a profile row would always exist and used `.single()` when fetching profile data. This caused a `PGRST116` error when no profile record was present. I reviewed the query behavior and adjusted the implementation accordingly.

These issues were identified through testing, browser console inspection, Supabase error messages, and manual verification.

## Future Improvements

With more time, I would add:

* Bookmark search and filtering
* Bookmark categories/tags
* Better public profile customization
* Pagination for large bookmark collections
* Analytics for public profile visits
* Improved email deliverability using a custom domain and verified sender

## Deployment

The application is deployed on Vercel.

Live URL:

```text
<your-vercel-url>
```
