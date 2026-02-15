# Smart Bookmark App (MemberBerries)

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Authenticated users can save, categorize, and manage their bookmarks with a responsive and modern UI.

## Features

- **Google Authentication**: Secure sign-up and login via Supabase Auth (Google OAuth).
- **Real-time Updates**: Bookmarks list updates instantly across tabs and devices without refreshing.
- **Categorization**: Organize bookmarks into expandable categories.
- **Responsive Design**: Mobile-friendly interface with a sidebar layout.
- **Privacy**: specific Row Level Security (RLS) policies ensure users only see their own bookmarks.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel

## Challenges & Solutions

### 1. Vercel Deployment Updates
**Problem:** After deploying updates, the live site seemed stuck on an old version.
**Solution:** I realized I was visiting an *immutable deployment URL* (a snapshot of a specific commit) rather than the main *production domain*. I fixed this by ensuring I always accessed the main `.vercel.app` domain and updated my bookmark/redirects accordingly.

### 2. Real-time Synchronization
**Problem:** When a bookmark was added in one tab, it didn't appear in another tab without a manual refresh.
**Solution:** I implemented Supabase Realtime subscriptions using the `postgres_changes` channel. The app now listens for `INSERT`, `UPDATE`, and `DELETE` events on the `bookmarks` table and updates the local state immediately.

### 3. Database Schema Evolution
**Problem:** Adding categories failed initially because the database table lacked the necessary column.
**Solution:** I updated the Supabase database schema by running an SQL migration: `ALTER TABLE bookmarks ADD COLUMN category text;`.

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up environment variables in `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Run the development server: `npm run dev`

## Deployment

Deployed live on Vercel: [https://member-berries.vercel.app](https://member-berries.vercel.app)
