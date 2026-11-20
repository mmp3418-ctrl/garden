import { CheckSquare, ImagePlus, Square, Trash2, UploadCloud, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FC } from 'react'
import { deleteMediaByPublicUrl, uploadMediaFile } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import type { GalleryItem } from '../../types'
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
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      onToast({ type: 'error', message: error.message || dict.error })
      setItems([])
    } else {
      setItems((data as GalleryItem[]) ?? [])
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
      for (const file of list) {
        const { publicUrl } = await uploadMediaFile('gallery', file)
        const { error } = await supabase.from('gallery_items').insert({
          image_url: publicUrl,
          title_ar: null,
          title_en: null,
          category_ar: null,
          category_en: null,
        })
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

  if (loading) return <p className="text-sm text-[var(--text-muted)]">{dict.loading}</p>

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
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white disabled:opacity-70"
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
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--glass-border)] px-3 text-xs font-semibold"
            >
              {selected.size === items.length ? <CheckSquare size={14} /> : <Square size={14} />}
              {dict.filterAll}
            </button>
          ) : null}
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-xs font-semibold text-red-400"
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
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item) => {
            const isSelected = selected.has(item.id)
            return (
              <li key={item.id} className="mb-4 break-inside-avoid">
                <div className={`glass overflow-hidden rounded-2xl ${isSelected ? 'ring-2 ring-cyan' : ''}`}>
                  <div className="relative">
                    <button
                      type="button"
                      className="absolute start-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/45 text-white"
                      onClick={() => toggleSelect(item.id)}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <button
                      type="button"
                      className="block w-full bg-[var(--bg-deep)]"
                      onClick={() => item.image_url && setLightbox(item.image_url)}
                    >
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-xs text-[var(--text-muted)]">
                          —
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 text-sm font-semibold text-red-400"
                    >
                      <Trash2 size={15} />
                      {dict.delete}
                    </button>
                  </div>
                </div>
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
