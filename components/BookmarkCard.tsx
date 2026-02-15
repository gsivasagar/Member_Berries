
'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from '@/types'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type BookmarkCardProps = {
    bookmark: Bookmark;
    isSelected: boolean;
    isEditing: boolean;
    editState: {
        title: string;
        url: string;
        category: string;
        urlError: boolean;
        setTitle: (val: string) => void;
        setUrl: (val: string) => void;
        setCategory: (val: string) => void;
        saveEdit: (id: string) => void;
        cancelEdit: () => void;
    };
    onSelect: (id: string) => void;
    onEdit: (b: Bookmark) => void;
    onDelete: (id: string) => void;
}

export default function BookmarkCard({
    bookmark,
    isSelected,
    isEditing,
    editState,
    onSelect,
    onEdit,
    onDelete
}: BookmarkCardProps) {
    const [preview, setPreview] = useState<{ image?: string, title?: string, description?: string } | null>(null)
    const [loadingPreview, setLoadingPreview] = useState(false)

    useEffect(() => {
        if (!bookmark.url) return;

        // Simple cache
        const cacheKey = `preview-${bookmark.url}`
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
            setPreview(JSON.parse(cached))
            return
        }

        setLoadingPreview(true)
        fetch(`/api/preview?url=${encodeURIComponent(bookmark.url)}`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    const previewData = {
                        image: data.image,
                        title: data.title,
                        description: data.description
                    }
                    setPreview(previewData)
                    sessionStorage.setItem(cacheKey, JSON.stringify(previewData))
                }
            })
            .catch(err => console.error('Preview error', err))
            .finally(() => setLoadingPreview(false))
    }, [bookmark.url])

    const b = bookmark

    return (
        <div
            className={`
                group relative flex flex-col overflow-hidden rounded-xl bg-gray-800 ring-1 ring-inset ring-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-gray-800/80
                ${isSelected ? 'ring-2 ring-indigo-500 bg-gray-800/50' : ''}
            `}
        >
            {/* Preview Image or Fallback */}
            {!isEditing && (
                <div className="h-40 w-full bg-gray-900 relative flex-shrink-0 overflow-hidden">
                    {preview?.image ? (
                        <img
                            src={preview.image}
                            alt={preview.title || b.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                setPreview(prev => prev ? ({ ...prev, image: undefined }) : null)
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                            <div className="text-4xl font-bold text-white/10 select-none">
                                {(b.title || b.url).charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* Overlay Gradient for readability if needed, though we separate text now */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-60" />
                </div>
            )}

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                <button onClick={() => onEdit(b)} className="p-1.5 rounded-full bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-700 shadow-md backdrop-blur-sm border border-white/10">
                    <PencilIcon className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(b.id)} className="p-1.5 rounded-full bg-gray-900/80 text-gray-300 hover:text-red-400 hover:bg-gray-700 shadow-md backdrop-blur-sm border border-white/10">
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="absolute top-3 left-3 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(b.id)}
                    className="h-4 w-4 rounded border-gray-600/50 bg-gray-900/80 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0 focus:ring-1 checked:bg-indigo-500 checked:border-indigo-500 transition-all duration-200 cursor-pointer hover:border-indigo-500/50 backdrop-blur-sm"
                />
            </div>

            <div className="p-4 flex flex-col flex-1 relative">
                {isEditing ? (
                    <div className="space-y-3 z-20 relative">
                        <input value={editState.title} onChange={e => editState.setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white" />
                        <input value={editState.category} onChange={e => editState.setCategory(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white" placeholder="Category" />
                        <input value={editState.url} onChange={e => editState.setUrl(e.target.value)} className={`w-full bg-gray-900 border rounded px-2 py-1 text-sm text-white ${editState.urlError ? 'border-red-500' : 'border-gray-700'}`} />
                        <div className="flex gap-2">
                            <button onClick={() => editState.saveEdit(b.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
                            <button onClick={editState.cancelEdit} className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start gap-x-3 mb-2">
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${b.url}&sz=32`}
                                alt=""
                                className="h-5 w-5 rounded flex-shrink-0 mt-0.5 opacity-70"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <h3 className="text-sm font-semibold leading-tight text-white line-clamp-2" title={b.title || preview?.title}>
                                {b.title || preview?.title || b.url}
                            </h3>
                        </div>
                        <div className="flex-1 min-h-[2.5rem]">
                            {preview?.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{preview.description}</p>}
                            <p className="text-xs leading-5 text-gray-500 break-all line-clamp-1 hover:text-indigo-400 transition-colors">
                                <a href={b.url} target="_blank" rel="noopener noreferrer">{b.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
                            </p>
                        </div>
                        <div className="mt-3 flex items-center gap-x-2 text-[10px] leading-4 text-gray-500">
                            {b.category && (
                                <span className="inline-flex items-center rounded-md bg-gray-700/50 px-2 py-0.5 font-medium text-gray-400 ring-1 ring-inset ring-gray-700/50">
                                    {b.category}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
