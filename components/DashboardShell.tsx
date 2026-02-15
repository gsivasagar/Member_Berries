'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/actions'








export default function DashboardShell({ user, children, headerContent }: { user: User, children: React.ReactNode, headerContent?: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

    return (
        <div className="min-h-full">
            <nav className="bg-indigo-600 shadow-lg relative">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="shrink-0 flex items-center gap-2">
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <span className="text-white text-xl font-bold tracking-wide ">MemberBerries</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">


                                <div className="relative ml-3">
                                    <div className="flex items-center gap-4 bg-indigo-700 px-4 py-2 rounded-full shadow-inner">
                                        <div className="h-8 w-8 rounded-full border-2 border-indigo-300 flex items-center justify-center text-white font-bold bg-indigo-500">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-sm text-white hidden sm:block">
                                            {user.email}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => signOut()}
                                            className="text-indigo-200 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="relative inline-flex items-center justify-center rounded-md p-2 text-indigo-200 hover:bg-indigo-700 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                                aria-controls="mobile-menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden" id="mobile-menu">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            <span className="block px-3 py-2 text-base font-medium text-white">MemberBerries</span>
                        </div>
                        <div className="border-t border-indigo-700 pb-3 pt-4">
                            <div className="flex items-center px-5">
                                <div className="shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 border-2 border-indigo-300 flex items-center justify-center text-white font-bold text-lg">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base/5 font-medium text-white">User</div>
                                    <div className="text-sm font-medium text-indigo-200">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                <button
                                    onClick={() => signOut()}
                                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <header className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {headerContent}
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-center text-sm text-gray-500">
                    v2.0.1
                </div>
            </footer>
        </div>
    )
}
