'use client'
import { useRef, useState } from 'react'
import type { Banner } from '@/types/admin'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props { initialBanners: Banner[] }

export default function BannerManager({ initialBanners }: Props) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editLinkUrl, setEditLinkUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function toggleActive(banner: Banner) {
    const res = await fetch(`/api/admin/banners/${banner.$id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.is_active }),
    })
    const updated = await res.json() as Banner
    setBanners(p => p.map(b => b.$id === updated.$id ? updated : b))
  }

  async function handleDelete() {
    if (!deleteId) return
    await fetch(`/api/admin/banners/${deleteId}`, { method: 'DELETE' })
    setBanners(p => p.filter(b => b.$id !== deleteId))
    setDeleteId(null)
  }

  async function saveLink() {
    if (!editId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/banners/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_url: editLinkUrl.trim() || null }),
      })
      const updated = await res.json() as Banner
      setBanners(p => p.map(b => b.$id === updated.$id ? updated : b))
      setEditId(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {banners.map(b => (
        <div key={b.$id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.image_url}
                alt={b.title}
                className="w-16 h-10 object-cover rounded-md border border-gray-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{b.title}</p>
                {b.link_url && <p className="text-xs text-gray-400 truncate">{b.link_url}</p>}
                {!b.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Inactive</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => toggleActive(b)} className="text-xs text-gray-400 hover:text-gray-600">
                {b.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => { setEditId(b.$id); setEditLinkUrl(b.link_url ?? '') }}
                className="text-xs text-amber-600 hover:text-amber-800 font-medium"
              >
                Edit link
              </button>
              <button onClick={() => setDeleteId(b.$id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </div>
          </div>

          {editId === b.$id && (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={editLinkUrl}
                onChange={e => setEditLinkUrl(e.target.value)}
                placeholder="Click-through URL (optional)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={saveLink}
                disabled={saving}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                Save
              </button>
              <button onClick={() => setEditId(null)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          )}
        </div>
      ))}

      <UploadNew
        onCreated={b => setBanners(p => [...p, b])}
        onError={setError}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Banner"
        message="This will permanently remove the banner."
        confirmLabel="Delete Permanently"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

function UploadNew({ onCreated, onError }: { onCreated: (b: Banner) => void; onError: (e: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')

  async function handleFile(file: File) {
    setUploading(true)
    onError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPreview(json.url)

      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
    } catch (err) {
      onError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function handleCreate() {
    if (!title.trim() || !preview) { onError('Upload an image and enter a title first'); return }
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), image_url: preview, link_url: linkUrl.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onCreated(json as Banner)
      setTitle(''); setLinkUrl(''); setPreview('')
    } catch (err) {
      onError((err as Error).message)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 border-2 border-dashed border-gray-200 hover:border-amber-300 transition-colors">
      <p className="text-sm font-semibold text-gray-700">Add New Banner</p>

      {/* Drop / click zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50 transition-colors"
        style={{ minHeight: preview ? undefined : 120 }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-48 rounded-md object-contain" />
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
            </svg>
            <p className="text-sm text-gray-400">{uploading ? 'Uploading…' : 'Click or drag to upload banner image'}</p>
            <p className="text-xs text-gray-300">JPEG, PNG, WebP — max 10 MB</p>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Banner Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Summer Promo 2026"
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Click-through URL</label>
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="/#accommodations"
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={uploading || !preview}
        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
      >
        {uploading ? 'Uploading…' : 'Add Banner'}
      </button>
    </div>
  )
}
