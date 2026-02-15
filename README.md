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

## Recent Updates

### v2.2.1 (Current)
- **UI Polish**: Removed footer for a cleaner look.
- **Refinement**: Smaller, transparent checkboxes for better aesthetics.

### v2.2.0
- **Dark Mode**: Complete overhaul of the UI to a dark theme.
- **Sidebar Navigation**: Replaced top navbar with a persistent left sidebar.
- **Tooling**: Moved search and add functionalities to a dedicated toolbar.

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
