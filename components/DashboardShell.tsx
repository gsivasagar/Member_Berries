import { useState, Fragment } from 'react'
import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/actions'
import Image from 'next/image'
import { HomeIcon, FolderIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'

type DashboardShellProps = {
    user: User;
    children: React.ReactNode;
    categories?: string[];
    currentCategory?: string;
    onCategoryChange?: (category: string) => void;
}

export default function DashboardShell({ user, children, categories = [], currentCategory = '', onCategoryChange }: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigation = [
        { name: 'All Bookmarks', icon: HomeIcon, id: '' },
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900">
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                {/* Mobile Sidebar Content */}
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
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
                                                                onClick={() => { onCategoryChange && onCategoryChange(item.id); setSidebarOpen(false); }}
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
                                                                    onClick={() => { onCategoryChange && onCategoryChange(category); setSidebarOpen(false); }}
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
                                                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                                                        <Image
                                                            src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                                            alt="Profile"
                                                            width={32}
                                                            height={32}
                                                            className="h-8 w-8 rounded-full bg-gray-800"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                                                            {user.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop Sidebar */}
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
                                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                                        <Image
                                            src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 rounded-full bg-gray-800"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
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
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 md:hidden">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-400 lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
                </div>

                <main className="flex-1 overflow-y-auto bg-slate-900 border-l border-white/5">
                    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}
