'use client'
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const supabase = createClient()

    const handleLogin = () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="mx-auto h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center animate-bounce shadow-md">
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Welcome
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to manage your bookmarks
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="bg-white py-8 px-8 shadow rounded-lg border border-gray-100">
                    <button
                        onClick={handleLogin}
                        type="button"
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}