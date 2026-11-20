import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  ImagePlus,
  Square,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FC } from 'react'
import { deleteMediaByPublicUrl, uploadMediaFile } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import type { GalleryItem } from '../../types'
import { withCacheBust } from '../../utils/mediaUrl'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onChanged?: () => void
}

const GalleryTab: FC<Props> = ({ dict, onToast, onChanged }) => {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async (): Promise<void> => {
    setLoading(true)
    let query = supabase.from('gallery_items').select('*').order('sort_order', { ascending: true })
    let { data, error } = await query

    // Fallback if sort_order column is missing
    if (error && /sort_order/i.test(error.message)) {
      const fallback = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      onToast({ type: 'error', message: error.message || dict.error })
      setItems([])
    } else {
      const rows = (data as GalleryItem[]) ?? []
      setItems(
        [...rows].sort((a, b) => {
          const ao = a.sort_order ?? Number.MAX_SAFE_INTEGER
          const bo = b.sort_order ?? Number.MAX_SAFE_INTEGER
          if (ao !== bo) return ao - bo
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }),
      )
    }
    setSelected(new Set())
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const uploadFiles = async (files: FileList | File[]): Promise<void> => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    setUploading(true)
    try {
      const startOrder =
        items.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0) + 1
      for (let i = 0; i < list.length; i += 1) {
        const file = list[i]!
        const { publicUrl } = await uploadMediaFile('gallery', file)
        const payload: Record<string, unknown> = {
          image_url: publicUrl,
          title_ar: null,
          title_en: null,
          category_ar: null,
          category_en: null,
          sort_order: startOrder + i,
        }
        let { error } = await supabase.from('gallery_items').insert(payload)
        if (error && /sort_order/i.test(error.message)) {
          delete payload.sort_order
          const retry = await supabase.from('gallery_items').insert(payload)
          error = retry.error
        }
        if (error) throw new Error(error.message)
      }
      onToast({ type: 'success', message: dict.saved })
      onChanged?.()
      await load()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files
    event.target.value = ''
    if (files?.length) void uploadFiles(files)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files?.length) void uploadFiles(event.dataTransfer.files)
  }

  const toggleSelect = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (): void => {
    if (selected.size === items.length) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(items.map((item) => item.id)))
  }

  const deleteOne = async (item: GalleryItem): Promise<void> => {
    const { error } = await supabase.from('gallery_items').delete().eq('id', item.id)
    if (error) throw new Error(error.message)
    if (item.image_url) {
      try {
        await deleteMediaByPublicUrl(item.image_url)
      } catch {
        /* best-effort */
      }
    }
  }

  const handleDelete = async (item: GalleryItem): Promise<void> => {
    if (!window.confirm(dict.confirmDelete)) return
    try {
      await deleteOne(item)
      onToast({ type: 'success', message: dict.saved })
      onChanged?.()
      await load()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    }
  }

  const handleBulkDelete = async (): Promise<void> => {
    if (selected.size === 0) return
    if (!window.confirm(dict.confirmDelete)) return
    try {
      const targets = items.filter((item) => selected.has(item.id))
      for (const item of targets) {
        await deleteOne(item)
      }
      onToast({ type: 'success', message: dict.saved })
      onChanged?.()
      await load()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    }
  }

  const swapOrder = async (index: number, direction: -1 | 1): Promise<void> => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    if (!moved) return
    next.splice(target, 0, moved)

    // Optimistic UI
    setItems(next)

    const results = await Promise.all(
      next.map((item, order) =>
        supabase.from('gallery_items').update({ sort_order: order + 1 }).eq('id', item.id),
      ),
    )
    const failed = results.find((res) => res.error)
    if (failed?.error) {
      if (!/sort_order/i.test(failed.error.message)) {
        onToast({ type: 'error', message: failed.error.message || dict.error })
      }
      await load()
      return
    }
    onChanged?.()
    await load()
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`glass flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? 'border-cyan bg-cyan/10' : 'border-[var(--glass-border)]'
        }`}
      >
        <UploadCloud className="text-cyan" size={28} />
        <p className="text-sm text-[var(--text-secondary)]">{dict.dropHint}</p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white disabled:opacity-70"
        >
          <ImagePlus size={16} />
          {uploading ? dict.uploading : dict.upload}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={handleUpload}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">
          {items.length} {dict.tabs.gallery}
          {selected.size > 0 ? ` · ${selected.size} ${dict.selected}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {items.length > 0 ? (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--glass-border)] px-3 text-sm font-semibold"
            >
              {selected.size === items.length ? <CheckSquare size={14} /> : <Square size={14} />}
              {dict.filterAll}
            </button>
          ) : null}
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-sm font-semibold text-red-400"
            >
              <Trash2 size={14} />
              {dict.bulkDelete}
            </button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
          {dict.noGallery}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => {
            const isSelected = selected.has(item.id)
            const src = item.image_url ? withCacheBust(item.image_url, item.id) : ''
            return (
              <li key={item.id}>
                <article
                  className={`glass overflow-hidden rounded-2xl ${isSelected ? 'ring-2 ring-cyan' : ''}`}
                >
                  <div className="relative aspect-square bg-[var(--bg-deep)]">
                    <button
                      type="button"
                      className="absolute start-2 top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 text-white"
                      onClick={() => toggleSelect(item.id)}
                      aria-label="Select"
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <button
                      type="button"
                      className="absolute end-2 top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 text-red-300"
                      onClick={() => void handleDelete(item)}
                      aria-label={dict.delete}
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="block h-full w-full"
                      onClick={() => item.image_url && setLightbox(item.image_url)}
                    >
                      {src ? (
                        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
                          —
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-1 p-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => void swapOrder(index, -1)}
                      className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[var(--glass-border)] disabled:opacity-40"
                      aria-label={dict.reorderUp}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => void swapOrder(index, 1)}
                      className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[var(--glass-border)] disabled:opacity-40"
                      aria-label={dict.reorderDown}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-[min(96vw,1100px)] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  )
}

export default GalleryTab
