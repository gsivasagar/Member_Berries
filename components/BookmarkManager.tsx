'use client'

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { User } from '@supabase/supabase-js'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { TrashIcon, PencilIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import DashboardShell from '@/components/DashboardShell'

type Bookmark = {
    id: string; title: string; url: string; user_id: string; category: string | null
}

type CategoryGroup = {
    name: string;
    bookmarks: Bookmark[];
    isOpen: boolean;
}

export default function BookmarkManager({ user }: { user: User }) {
    const supabase = createClient()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [category, setCategory] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

    const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set())

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editUrl, setEditUrl] = useState('')
    const [editCategory, setEditCategory] = useState('')

    const [urlError, setUrlError] = useState(false)

    const [editUrlError, setEditUrlError] = useState(false)

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

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
        if (bookmarks.length > 0) {
            setExpandedCategories(prev => {
                const uniqueCategories = Array.from(new Set(bookmarks.map(b => b.category || 'Uncategorized')))
                const newState = { ...prev }
                uniqueCategories.forEach(cat => {
                    if (newState[cat] === undefined) {
                        newState[cat] = true
                    }
                })
                return newState
            })
        }
    }, [bookmarks])

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

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }))
    }

    const filteredBookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const groupedBookmarks: Record<string, Bookmark[]> = filteredBookmarks.reduce((groups, bookmark) => {
        const cat = bookmark.category || 'Uncategorized';
        if (!groups[cat]) {
            groups[cat] = [];
        }
        groups[cat].push(bookmark);
        return groups;
    }, {} as Record<string, Bookmark[]>);

    const sortedCategories = Object.keys(groupedBookmarks).sort();



    const toggleCategorySelection = (cat: string) => {
        const categoryBookmarks = groupedBookmarks[cat]
        const allSelected = categoryBookmarks.every(b => selectedBookmarks.has(b.id))

        setSelectedBookmarks(prev => {
            const newSet = new Set(prev)
            if (allSelected) {
                categoryBookmarks.forEach(b => newSet.delete(b.id))
            } else {
                categoryBookmarks.forEach(b => newSet.add(b.id))
            }
            return newSet
        })
    }

    return (
        <DashboardShell user={user}>
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircleIcon className="size-5 text-green-500" />
                    ) : (
                        <ExclamationCircleIcon className="size-5 text-red-500" />
                    )}
                    <span className="font-medium text-sm">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="size-4" />
                    </button>
                </div>
            )}
            <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-72 shrink-0 space-y-6 order-1 md:order-none">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-6 sticky top-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="p-1 bg-indigo-100 rounded text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                Search
                            </h3>
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 bg-gray-50 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                placeholder="Filter bookmarks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        <form onSubmit={addBookmark} className="flex flex-col gap-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="p-1 bg-indigo-100 rounded text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                                    </svg>
                                </span>
                                Add New
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                <input
                                    className="block w-full rounded-md border-0 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                    placeholder="e.g., Work, Study"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <input
                                    className="block w-full rounded-md border-0 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                    placeholder="Bookmark Title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                                <input
                                    className={`block w-full rounded-md border-0 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm ${urlError
                                        ? 'ring-red-300 focus:ring-red-500 bg-red-50 text-red-900'
                                        : 'ring-gray-300 focus:ring-indigo-600'
                                        }`}
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={e => {
                                        setUrl(e.target.value)
                                        setUrlError(!isValidUrl(e.target.value))
                                    }}
                                />
                            </div>
                            <button
                                className="w-full rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition-colors"
                                disabled={urlError || !title || !url}
                            >
                                Add Bookmark
                            </button>
                        </form>
                    </div>
                </aside>

                <main className="flex-1 space-y-6 order-2 md:order-none min-w-0">
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    checked={bookmarks.length > 0 && selectedBookmarks.size === bookmarks.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedBookmarks(new Set(bookmarks.map(b => b.id)))
                                        } else {
                                            setSelectedBookmarks(new Set())
                                        }
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700">Select All</span>
                            </label>


                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 mr-2">{selectedBookmarks.size} selected</span>
                            <button
                                onClick={deleteSelected}
                                title="Delete Selected"
                                className="flex items-center justify-center rounded-md bg-red-50 p-2 text-red-600 shadow-sm hover:bg-red-100 ring-1 ring-inset ring-red-100 transition-colors"
                            >
                                <TrashIcon className="size-5" />
                            </button>
                        </div>
                    </div>

                    {sortedCategories.map(cat => (
                        <div key={cat} className="mb-8">
                            <div className="flex items-center justify-between p-2 mb-4 hover:bg-gray-100 rounded transition-colors group">
                                <div className="flex items-center gap-3 w-full">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        checked={groupedBookmarks[cat].every(b => selectedBookmarks.has(b.id))}
                                        onChange={() => toggleCategorySelection(cat)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={() => toggleCategory(cat)}
                                        className="flex-1 flex items-center justify-between focus:outline-hidden"
                                    >
                                        <span className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                                            {cat}
                                            <span className="text-sm font-normal text-gray-500">({groupedBookmarks[cat].length})</span>
                                        </span>
                                        {expandedCategories[cat] ? (
                                            <ChevronDownIcon className="size-6 text-gray-400" />
                                        ) : (
                                            <ChevronRightIcon className="size-6 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {expandedCategories[cat] && (
                                <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                                    {groupedBookmarks[cat].map(b => (
                                        <li key={b.id} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">

                                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-2xl"></div>

                                            <div className="flex justify-between items-start mb-4 pl-3">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                        checked={selectedBookmarks.has(b.id)}
                                                        onChange={() => toggleSelection(b.id)}
                                                    />
                                                    {editingId === b.id ? (
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <input
                                                                className="border p-2 rounded text-black text-sm w-full"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                placeholder="Title"
                                                            />
                                                            <input
                                                                className={`border p-2 rounded text-sm w-full ${editUrlError
                                                                    ? 'border-red-500 bg-red-50 text-red-900'
                                                                    : 'border-gray-300 text-black'
                                                                    }`}
                                                                value={editUrl}
                                                                onChange={(e) => {
                                                                    setEditUrl(e.target.value)
                                                                    setEditUrlError(false)
                                                                }}
                                                                placeholder="URL"
                                                            />
                                                            <input
                                                                className="border p-2 rounded text-black text-sm w-full"
                                                                value={editCategory}
                                                                onChange={(e) => setEditCategory(e.target.value)}
                                                                placeholder="Category"
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button onClick={() => saveEdit(b.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                                                                    Save
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} className="bg-gray-200 text-black px-3 py-1 rounded text-xs hover:bg-gray-300">
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <h3 className="text-xl font-bold text-gray-800 truncate" title={b.title}>
                                                            {b.title}
                                                        </h3>
                                                    )}
                                                </div>

                                                {!editingId && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditing(b)} className="text-gray-400 hover:text-indigo-600 p-1" title="Edit">
                                                            <PencilIcon className="size-5" />
                                                        </button>
                                                        <button onClick={() => deleteBookmark(b.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete">
                                                            <TrashIcon className="size-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {!editingId && (
                                                <div className="pl-3 mt-2">
                                                    <a href={b.url} target="_blank" className="text-indigo-600 text-sm hover:underline block truncate" title={b.url}>
                                                        {b.url}
                                                    </a>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    {sortedCategories.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No bookmarks found. Add one key to get started!
                        </div>
                    )}
                </main>
            </div>
        </DashboardShell>
    )
}