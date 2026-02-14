'use client'
import { createClient } from "@/lib/supabase/client";

export default function LoginPage(){
    const supabase =createClient()

    const handleLogin = () => {
        supabase.auth.signInWithOAuth({
            provider:'google',
            options:{
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }
    
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="p-10 bg-white rounded-lg shadow-xl text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Smart Bookmarks</h1>
            <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
            <span>Sign in with Google</span>
            </button>
        </div>
        </div>
    );
}