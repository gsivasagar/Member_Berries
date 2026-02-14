# Mark I Documentation

## 1. Frontend Documentation

### 1.1 Overview
The frontend is built using **Next.js 16 (App Router)** with **TypeScript** and **Tailwind CSS 4**. It provides a responsive user interface for managing bookmarks, with real-time updates.

### 1.2 Key Components

#### `app/page.tsx` (Home Page)
-   **Type**: Server Component
-   **Functionality**:
    -   Acts as a protected route.
    -   Checks for an active Supabase session using `createClient` from `@/lib/supabase/server`.
    -   Redirects unauthenticated users to `/login`.
    -   Displays the user's email and a logout button.
    -   Renders the `BookmarkManager` client component.

#### `app/login/page.tsx` (Login Page)
-   **Type**: Client Component
-   **Functionality**:
    -   Provides the entry point for authentication.
    -   Features a "Sign in with Google" button.
    -   Uses `supabase.auth.signInWithOAuth` to initiate the OAuth flow, redirecting to `${location.origin}/auth/callback`.

#### `components/BookmarkManager.tsx`
-   **Type**: Client Component
-   **Functionality**:
    -   **State Management**: Uses `useState` for storing bookmarks, form inputs, and editing state.
    -   **Data Fetching**: Fetches initial bookmarks from Supabase on mount via `useEffect`.
    -   **Real-time Updates**: Subscribes to Supabase Realtime changes (`postgres_changes`) on the `bookmarks` table to automatically update the UI on `INSERT` or `DELETE` events.
    -   **CRUD Operations**:
        -   **Create**: `addBookmark` inserts a new record.
        -   **Update**: `saveEdit` updates an existing bookmark title/URL.
        -   **Delete**: `deleteBookmark` removes a bookmark.
    -   **UI**: Renders a list of bookmarks with Edit/Delete actions and a form for adding new ones.

### 1.3 Styling
-   Uses **Tailwind CSS** for utility-first styling.
-   `app/globals.css` imports Tailwind directives.
-   Font optimization provided by `next/font/google` (Geist Sans/Mono).

---

## 2. Backend Documentation

### 2.1 Overview
The backend architecture is serverless, leveraging **Next.js Server Actions/Routes** and **Supabase** (BaaS) for database, authentication, and realtime capabilities.

### 2.2 Authentication & Authorization
-   **Provider**: Supabase Auth (Google OAuth).
-   **Middleware/Server Checks**:
    -   `lib/supabase/server.ts`: creates a Supabase client capable of handling cookies (`sb-access-token`, `sb-refresh-token`) in a Next.js server environment.
    -   `app/page.tsx` verifies the session before rendering protected content.

### 2.3 Database Schema (PostgreSQL)
**Table**: `bookmarks`
-   **RLS (Row Level Security)**: (Implied) The app filters by `user_id` on the client, but secure apps should have RLS policies enabled on Supabase to prevent unauthorized access.
-   **Columns**:
    | Column Name | Type | Description |
    | :--- | :--- | :--- |
    | `id` | UUID | Primary Key |
    | `title` | TEXT | Bookmark Title |
    | `url` | TEXT | Bookmark URL |
    | `user_id` | UUID | Foreign Key to `auth.users` |
    | `created_at`| TIMESTAMPTZ | Creation timestamp |

### 2.4 API Routes & Server Actions

#### `app/auth/callback/route.ts` (GET)
-   **Purpose**: Handles the OAuth callback from Google.
-   **Flow**:
    1.  Receives `code` from the query parameters.
    2.  Exchanges the code for a session using `supabase.auth.exchangeCodeForSession(code)`.
    3.  Redirects the user back to the origin (or a `next` param).

#### `app/actions.ts`
-   **`signOut()`**:
    -   **Type**: Server Action
    -   **Purpose**: secure server-side logout.
    -   **Flow**: Creates a server implementation of the Supabase client, calls `signOut()`, and redirects to `/login`.

### 2.5 Infrastructure
-   **Database**: Managed PostgreSQL on Supabase.
-   **Realtime**: logical replication slots enabled on the `bookmarks` table to push changes to clients via WebSockets.
