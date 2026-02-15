import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/actions'
import Image from 'next/image'
import { HomeIcon, FolderIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

type DashboardShellProps = {
    user: User;
    children: React.ReactNode;
    categories?: string[];
    currentCategory?: string;
    onCategoryChange?: (category: string) => void;
}

export default function DashboardShell({ user, children, categories = [], currentCategory = '', onCategoryChange }: DashboardShellProps) {
    const navigation = [
        { name: 'All Bookmarks', icon: HomeIcon, id: '' },
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 border-r border-gray-800">
                    <div className="flex h-16 shrink-0 items-center gap-2 mt-2">
                        <Image
                            src="/logo.svg"
                            alt="Member Berries"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full bg-indigo-500 p-1"
                        />
                        <span className="text-white text-lg font-semibold tracking-tight">MemberBerries</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <div className="text-xs font-semibold leading-6 text-gray-400">Dashboard</div>
                                <ul role="list" className="-mx-2 mt-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => onCategoryChange && onCategoryChange(item.id)}
                                                className={`
                                                    group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                                                    ${currentCategory === item.id
                                                        ? 'bg-gray-800 text-white'
                                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                                                `}
                                            >
                                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                {item.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            {categories.length > 0 && (
                                <li>
                                    <div className="text-xs font-semibold leading-6 text-gray-400">Categories</div>
                                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                                        {categories.map((category) => (
                                            <li key={category}>
                                                <button
                                                    onClick={() => onCategoryChange && onCategoryChange(category)}
                                                    className={`
                                                        group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                                                        ${currentCategory === category
                                                            ? 'bg-gray-800 text-white'
                                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                                                    `}
                                                >
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                                        {category.charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="truncate">{category}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            )}
                            <li className="mt-auto">
                                <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-white bg-gray-800/50 -mx-6 px-6 border-t border-gray-800">
                                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="sr-only">Your profile</span>
                                    <div className="flex flex-col truncate">
                                        <span aria-hidden="true">{user.email?.split('@')[0]}</span>
                                        <button onClick={() => signOut()} className="text-xs text-left text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                            <ArrowRightOnRectangleIcon className="w-3 h-3" /> Sign out
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-slate-900 border-l border-white/5">
                    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-center text-sm text-gray-500">
                        v2.2.0
                    </div>
                </footer>
            </div>
        </div>
    )
}
