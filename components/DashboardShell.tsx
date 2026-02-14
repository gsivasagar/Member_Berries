'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/actions'

const navigation = [
    { name: 'My Bookmarks', href: '#', current: true },
    { name: 'Team', href: '#', current: false },
    { name: 'Projects', href: '#', current: false },
    { name: 'Calendar', href: '#', current: false },
    { name: 'Reports', href: '#', current: false },
]

const userNavigation = [
    { name: 'Your profile', href: '#' },
    { name: 'Settings', href: '#' },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function DashboardShell({ user, children }: { user: User, children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

    return (
        <div className="min-h-full">
            <nav className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="shrink-0">
                                <img
                                    className="size-8 animate-bounce"
                                    src="/member-berries.png"
                                    alt="Member Berries"
                                />
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    {navigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            aria-current={item.current ? 'page' : undefined}
                                            className={classNames(
                                                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                'rounded-md px-3 py-2 text-sm font-medium',
                                            )}
                                        >
                                            {item.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <button
                                    type="button"
                                    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">View notifications</span>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                </button>

                                {/* Profile dropdown */}
                                <div className="relative ml-3">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                            id="user-menu-button"
                                            aria-expanded={isProfileMenuOpen}
                                            aria-haspopup="true"
                                        >
                                            <span className="absolute -inset-1.5" />
                                            <span className="sr-only">Open user menu</span>
                                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                        </button>
                                    </div>

                                    {isProfileMenuOpen && (
                                        <div
                                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden"
                                            role="menu"
                                            aria-orientation="vertical"
                                            aria-labelledby="user-menu-button"
                                            tabIndex={-1}
                                        >
                                            <div className="px-4 py-2 text-xs text-gray-500 border-b">
                                                {user.email}
                                            </div>
                                            {userNavigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                    tabIndex={-1}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                            <button
                                                onClick={() => signOut()}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                role="menuitem"
                                                tabIndex={-1}
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
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

                {/* Mobile menu, show/hide based on menu state. */}
                {isMobileMenuOpen && (
                    <div className="md:hidden" id="mobile-menu">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    aria-current={item.current ? 'page' : undefined}
                                    className={classNames(
                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block rounded-md px-3 py-2 text-base font-medium',
                                    )}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>
                        <div className="border-t border-gray-700 pb-3 pt-4">
                            <div className="flex items-center px-5">
                                <div className="shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base/5 font-medium text-white">User</div>
                                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                                </div>
                                <button
                                    type="button"
                                    className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">View notifications</span>
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                {userNavigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                                <button
                                    onClick={() => signOut()}
                                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
