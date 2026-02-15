'use client'

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { User } from '@supabase/supabase-js'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { TrashIcon, PencilIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, FolderIcon } from '@heroicons/react/24/outline'
import DashboardShell from '@/components/DashboardShell'

type Bookmark = {
    id: string; title: string; url: string; user_id: string; category: string | null
}

export default function BookmarkManager({ user }: { user: User }) {
    const supabase = createClient()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [category, setCategory] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set())

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editUrl, setEditUrl] = useState('')
    const [editCategory, setEditCategory] = useState('')

    const [urlError, setUrlError] = useState(false)
    const [editUrlError, setEditUrlError] = useState(false)

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])


    const fetchBookmarks = useCallback(async () => {
        const { data } = await supabase.from('bookmarks').select('*').order('created_at', { ascending: false })
        if (data) {
            setBookmarks(data)
        }
    }, [supabase])

    useEffect(() => {
        fetchBookmarks()
        const interval = setInterval(fetchBookmarks, 5000)
        return () => clearInterval(interval)
    }, [fetchBookmarks])

    useEffect(() => {
        const channel = supabase
            .channel('realtime bookmarks')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bookmarks',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setBookmarks((prev) => {
                        const alreadyExists = prev.some(b => b.id === payload.new.id)
                        if (alreadyExists) {
                            return prev
                        }
                        return [payload.new as Bookmark, ...prev]
                    })
                }
                else if (payload.eventType === 'DELETE') {
                    setBookmarks((prev) => prev.filter(b => b.id !== payload.old.id))
                    setSelectedBookmarks(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(payload.old.id)
                        return newSet
                    })
                }
                else if (payload.eventType === 'UPDATE') {
                    setBookmarks((prev) =>
                        prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
                    )
                }
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [supabase, user.id])

    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch (e) {
            return false;
        }
    }

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return

        const isDuplicate = bookmarks.some(b =>
            b.title.toLowerCase() === title.toLowerCase() &&
            (b.category || '').toLowerCase() === category.toLowerCase()
        )

        if (isDuplicate) {
            setNotification({ message: "A bookmark with this title already exists in this category", type: 'error' })
            return
        }

        const tempId = Math.random().toString(36).substr(2, 9)
        const newBookmark: Bookmark = { id: tempId, title, url, user_id: user.id, category: category || null }
        setBookmarks((prev) => [newBookmark, ...prev])
        setNotification({ message: "Bookmark added successfully", type: 'success' })
        setIsAddModalOpen(false)

        const { data, error } = await supabase.from('bookmarks').insert({ title, url, user_id: user.id, category: category || null }).select()

        if (error) {
            console.error(error)
            setBookmarks((prev) => prev.filter(b => b.id !== tempId))
            setNotification({ message: "Failed to add bookmark", type: 'error' })
        } else if (data) {
            setBookmarks((prev) => prev.map(b => b.id === tempId ? data[0] : b))
        }

        setTitle('')
        setUrl('')
        setCategory('')
    }

    const deleteBookmark = async (id: string) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
        setSelectedBookmarks(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', id)

        if (error) {
            console.error("Error deleting:", error.message)
        }
    }

    const toggleSelection = (id: string) => {
        setSelectedBookmarks(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const deleteSelected = async () => {
        const idsToDelete = Array.from(selectedBookmarks)
        if (idsToDelete.length === 0) return

        setBookmarks(prev => prev.filter(b => !selectedBookmarks.has(b.id)))
        setSelectedBookmarks(new Set())
        setNotification({ message: `Deleted ${idsToDelete.length} bookmarks`, type: 'success' })

        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .in('id', idsToDelete)

        if (error) {
            console.error("Error deleting selected:", error.message)
            setNotification({ message: "Failed to delete bookmarks", type: 'error' })
            fetchBookmarks()
        }
    }

    const startEditing = (b: Bookmark) => {
        setEditingId(b.id)
        setEditTitle(b.title)
        setEditUrl(b.url)
        setEditCategory(b.category || '')
    }

    const saveEdit = async (id: string) => {
        if (!isValidUrl(editUrl)) {
            alert("Please enter a valid URL (e.g., https://example.com)")
            return
        }

        const { error } = await supabase
            .from('bookmarks')
            .update({ title: editTitle, url: editUrl, category: editCategory || null })
            .eq('id', id)
        if (error) {
            console.error("Update Error:", error.message)
            alert("Error saving edit: " + error.message)
            return
        }
        setBookmarks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, title: editTitle, url: editUrl, category: editCategory || null } : b))
        )
        setEditingId(null)
    }

    // Calculate categories dynamically
    const categories = Array.from(new Set(bookmarks.map(b => b.category).filter(Boolean))) as string[]

    // Filter bookmarks based on sidebar selection AND search query
    const displayedBookmarks = bookmarks.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.url.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory ? b.category === selectedCategory : true

        return matchesSearch && matchesCategory;
    })

    return (
        <DashboardShell
            user={user}
            categories={categories}
            currentCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
        >
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${notification.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircleIcon className="size-5 text-green-400" />
                    ) : (
                        <ExclamationCircleIcon className="size-5 text-red-400" />
                    )}
                    <span className="font-medium text-sm">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 text-gray-400 hover:text-white">
                        <XMarkIcon className="size-4" />
                    </button>
                </div>
            )}

            {/* Toolbar Area */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 bg-gray-800 py-2.5 pl-10 pr-3 text-white placeholder:text-gray-400 focus:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 shadow-sm ring-1 ring-inset ring-white/10"
                        placeholder="Search bookmarks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    {selectedBookmarks.size > 0 && (
                        <button
                            onClick={deleteSelected}
                            className="inline-flex items-center gap-x-2 rounded-md bg-red-500/10 px-3.5 py-2.5 text-sm font-semibold text-red-400 shadow-sm hover:bg-red-500/20 ring-1 ring-inset ring-red-500/20 transition-colors"
                        >
                            <TrashIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            Delete ({selectedBookmarks.size})
                        </button>
                    )}
                    <button
                        onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                        className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                    >
                        <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Add Bookmark
                    </button>
                </div>
            </div>

            {/* Quick Add Form (Inline for now, toggled) */}
            {isAddModalOpen && (
                <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-white/5 shadow-xl">
                    <h3 className="text-lg font-medium leading-6 text-white mb-4">Add New Bookmark</h3>
                    <form onSubmit={addBookmark} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                            <input
                                className="block w-full rounded-md border-0 bg-gray-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                placeholder="Social, Work..."
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                            <input
                                className="block w-full rounded-md border-0 bg-gray-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                placeholder="My Link"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
                            <input
                                className={`block w-full rounded-md border-0 bg-gray-900/50 py-2 px-3 text-white shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${urlError ? 'ring-red-500 focus:ring-red-500' : 'ring-white/10 focus:ring-indigo-500'}`}
                                placeholder="https://..."
                                value={url}
                                onChange={e => {
                                    setUrl(e.target.value)
                                    setUrlError(!isValidUrl(e.target.value))
                                }}
                            />
                        </div>
                        <div className="md:col-span-1 flex gap-2">
                            <button
                                type="submit"
                                disabled={urlError || !title || !url}
                                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bookmarks Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedBookmarks.map((b) => (
                    <div
                        key={b.id}
                        className={`
                            group relative flex flex-col overflow-hidden rounded-xl bg-gray-800 ring-1 ring-inset ring-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-gray-800/80
                            ${selectedBookmarks.has(b.id) ? 'ring-2 ring-indigo-500 bg-gray-800/50' : ''}
                        `}
                    >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                            <button onClick={() => startEditing(b)} className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteBookmark(b.id)} className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:text-red-400 hover:bg-gray-600">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="absolute top-3 left-3 z-10">
                            <input
                                type="checkbox"
                                checked={selectedBookmarks.has(b.id)}
                                onChange={() => toggleSelection(b.id)}
                                className="h-4 w-4 rounded border-gray-600/50 bg-gray-700/20 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0 focus:ring-1 checked:bg-indigo-500 checked:border-indigo-500 transition-all duration-200 cursor-pointer hover:border-indigo-500/50"
                            />
                        </div>

                        <div className="p-6 flex flex-col h-full">
                            {editingId === b.id ? (
                                <div className="space-y-3">
                                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
                                    <input value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white" placeholder="Category" />
                                    <input value={editUrl} onChange={e => { setEditUrl(e.target.value); setEditUrlError(false) }} className={`w-full bg-gray-900 border rounded px-2 py-1 text-sm text-white ${editUrlError ? 'border-red-500' : 'border-gray-700'}`} />
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(b.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
                                        <button onClick={() => setEditingId(null)} className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-x-3 mb-4">
                                        <h3 className="text-base font-semibold leading-7 tracking-tight text-white truncate" title={b.title}>
                                            {b.title}
                                        </h3>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm leading-6 text-gray-400 break-all line-clamp-2 hover:text-indigo-400 transition-colors">
                                            <a href={b.url} target="_blank" rel="noopener noreferrer">{b.url.replace(/^https?:\/\//, '')}</a>
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                        {b.category && (
                                            <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
                                                {b.category}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {displayedBookmarks.length === 0 && (
                <div className="text-center py-20">
                    <div className="mx-auto h-17 w-17 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                        <FolderIcon className="h-10 w-10 text-gray-600" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white">No bookmarks found</h3>
                    <p className="mt-1 text-sm text-gray-400">Get started by creating a new bookmark.</p>
                </div>
            )}
        </DashboardShell>
    )
}