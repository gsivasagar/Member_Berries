'use client'

import Image from "next/image";
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
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-slate-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/logo.svg"
                        alt="Member Berries"
                        width={100}
                        height={100}
                        className="animate-bounce drop-shadow-md rounded-full bg-indigo-500 p-2"
                    />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                    Welcome
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Sign in to manage your bookmarks
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="bg-gray-800 py-8 px-8 shadow rounded-lg border border-gray-700">
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