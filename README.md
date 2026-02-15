# Smart Bookmark App (MemberBerries)

A real-time bookmark manager built with **Next.js 16**, **Supabase**, and **Tailwind CSS**. Authenticated users can save, categorize, and manage their bookmarks with a premium, dark-themed UI.

![MemberBerries Logo](/public/logo.svg)

## Features (v2.2.1)

- **Dark Sidebar Layout**: A modern, fixed sidebar navigation with a unified dark theme (`Slate 900`).
- **Real-time Updates**: Bookmarks sync instantly across devices using Supabase Realtime.
- **Enhanced Management**:
    -   **Categorization**: Organize bookmarks into custom categories.
    -   **Search & Filter**: Instantly filter bookmarks by title, URL, or category.
    -   **Bulk Actions**: Select multiple bookmarks to delete in batches.
- **Secure Authentication**: Google OAuth sign-in via Supabase Auth.
- **Responsive Design**: Fully responsive grid layout optimized for all screen sizes.

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
**Solution:** I implemented **Supabase Realtime** subscriptions using the `postgres_changes` channel. The app now listens for `INSERT`, `UPDATE`, and `DELETE` events on the `bookmarks` table and updates the local React state immediately, ensuring a seamless experience across devices.

### 3. Database Schema Evolution
**Problem:** Adding categories initially failed because the database table lacked the necessary column, and Supabase is a relational database requiring strict schema definitions.
**Solution:** I updated the Supabase database schema by running an SQL migration: `ALTER TABLE bookmarks ADD COLUMN category text;`. This allowed the new category feature to function correctly without data loss.

### 4. Implementing Dark Mode Sidebar (V3)
**Problem:** The user requested a complete UI overhaul to a "Dark Sidebar" layout, which required shifting from a top-navbar structure to a fixed-sidebar one and inverting the color scheme.
**Solution:** 
-   **Layout**: I refactored `DashboardShell` to use a fixed `aside` for navigation and a scrollable `main` area.
-   **Theming**: I updated `globals.css` with new dark theme variables and rigorously updated all Tailwind classes in `BookmarkManager`, `LoginPage`, and `DashboardShell` to use `bg-slate-900`, `text-white`, and `border-white/5` for a premium dark aesthetic.
-   **Tooling**: I consolidated the Search and Add functionalities into a new "Toolbar" component within the main content area to keep the sidebar clean for navigation.

### 5. Infinite Loops & Build Errors
**Problem:** During refactoring, I encountered infinite loops in the `useEffect` for fetching bookmarks and build errors due to missing imports (`FolderIcon`).
**Solution:** 
-   I optimized the `fetchBookmarks` dependency array to prevent unnecessary re-renders.
-   I ran a strict linting check, removing unused variables and ensuring all Heroicons were correctly imported before finalizing the build.

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
