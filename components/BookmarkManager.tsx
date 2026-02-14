'use client'

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import {User} from '@supabase/supabase-js'

type Bookmark ={
    id:string; title: string; url: string; user_id:string
}

export default function BookmarkManager({user}:{user:User}){
    const supabase = createClient()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title,setTitle] = useState('')
    const [url, setUrl] = useState('')

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editUrl, setEditUrl] = useState('')

    useEffect(() =>{
        const fetchBookmarks = async() =>{
            const{data}=await supabase.from('bookmarks').select('*').order('created_at',{ascending:false})
            if(data){
                setBookmarks(data)
            }
        }
        fetchBookmarks()
    },[])

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

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return
        
        await supabase.from('bookmarks').insert({ title, url, user_id: user.id })
        
        setTitle('')
        setUrl('')
    }

    const deleteBookmark = async (id: string) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
            const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', id)
    
        if (error) {
            console.error("Error deleting:", error.message)
        }
    }

    const startEditing = (b: Bookmark) => {
        setEditingId(b.id)
        setEditTitle(b.title)
        setEditUrl(b.url)
    }

    const saveEdit = async (id: string) => {
        const { error } = await supabase
            .from('bookmarks')
            .update({ title: editTitle, url: editUrl })
            .eq('id', id)
        if (error) {
            console.error("❌ Update Error:", error.message)
            alert("Error saving edit: " + error.message)
            return 
        }
        setBookmarks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, title: editTitle, url: editUrl } : b))
        )
        setEditingId(null)
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <form onSubmit={addBookmark} className="bg-white p-6 rounded shadow mb-6 flex gap-2">
                <input
                    className="border p-2 rounded flex-1 text-black placeholder-black"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <input
                    className="border p-2 rounded flex-1 text-black placeholder-black"
                    placeholder="URL"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
                <button className="bg-green-600 text-white px-4 rounded hover:bg-green-700">Add</button>
            </form>

            <ul className="space-y-2">
                {bookmarks.map(b => (
                    <li key={b.id} className="bg-white p-4 rounded shadow flex justify-between items-center gap-4">
                        
                        {editingId === b.id ? (
                            <div className="flex-1 flex gap-2 w-full">
                                <input
                                    className="border p-2 rounded flex-1 text-black"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                                <input
                                    className="border p-2 rounded flex-1 text-black"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                />
                                <button onClick={() => saveEdit(b.id)} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
                                    Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="bg-gray-200 text-black px-4 py-1 rounded hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <a href={b.url} target="_blank" className="text-blue-600 font-medium hover:underline flex-1 truncate">
                                    {b.title}
                                </a>
                                <div className="flex gap-4">
                                    <button onClick={() => startEditing(b)} className="text-blue-500 hover:text-blue-700 font-medium">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteBookmark(b.id)} className="text-red-500 hover:text-red-700 font-medium">
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}

                    </li>
                ))}
            </ul>
        </div>
    )
}