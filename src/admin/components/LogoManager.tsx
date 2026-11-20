import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type DragEvent, type FC } from 'react'
import { BRAND_NAME } from '../../data/content'
import { deleteMediaByPublicUrl, uploadLogoFile } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import type { AdminDictionary } from '../i18n'
import type { ToastState } from './AdminToast'

const ACCEPTED =
  'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg'

interface LogoManagerProps {
  dict: AdminDictionary
  rowId: string | number
  logoUrl: string
  onLogoChange: (url: string) => void
  onToast: (toast: ToastState) => void
  onSaved?: () => void
}

const LogoManager: FC<LogoManagerProps> = ({
  dict,
  rowId,
  logoUrl,
  onLogoChange,
  onToast,
  onSaved,
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const persistLogoUrl = async (url: string | null): Promise<void> => {
    const { error } = await supabase
      .from('site_settings')
      .update({ logo_url: url, updated_at: new Date().toISOString() })
      .eq('id', rowId)
    if (error) {
      // Fallback upsert for empty table / missing column still typed as string
      const upsert = await supabase
        .from('site_settings')
        .upsert({ id: rowId === 1 || rowId === '1' ? 1 : rowId, logo_url: url, updated_at: new Date().toISOString() })
      if (upsert.error) throw new Error(upsert.error.message)
    }
  }

  const upload = async (file: File): Promise<void> => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    const byExt = /\.(png|jpe?g|webp|svg)$/i.test(file.name)
    if (!allowed.includes(file.type) && !byExt) {
      onToast({ type: 'error', message: dict.error })
      return
    }

    setUploading(true)
    try {
      const previous = logoUrl
      const { publicUrl } = await uploadLogoFile(file)
      await persistLogoUrl(publicUrl)
      onLogoChange(publicUrl)
      if (previous && previous !== publicUrl) {
        try {
          await deleteMediaByPublicUrl(previous)
        } catch {
          /* best-effort */
        }
      }
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void upload(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void upload(file)
  }

  const handleRemove = async (): Promise<void> => {
    if (!logoUrl) return
    if (!window.confirm(dict.confirmDelete)) return
    setUploading(true)
    try {
      const previous = logoUrl
      await persistLogoUrl(null)
      onLogoChange('')
      try {
        await deleteMediaByPublicUrl(previous)
      } catch {
        /* best-effort */
      }
      onToast({ type: 'success', message: dict.saved })
      onSaved?.()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="glass space-y-4 rounded-2xl p-5 sm:p-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{dict.websiteLogo}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{dict.logoHint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0B192C] p-4">
          <p className="mb-3 text-[11px] font-semibold text-cyan">{dict.logoDarkPreview}</p>
          <div className="flex min-h-20 items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-12 w-auto max-w-[140px] object-contain" />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white">
                GC
              </span>
            )}
            <span className="font-display text-sm font-bold text-white" dir="ltr">
              {BRAND_NAME}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
          <p className="mb-3 text-[11px] font-semibold text-[#0078D7]">{dict.logoLightPreview}</p>
          <div className="flex min-h-20 items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-12 w-auto max-w-[140px] object-contain" />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white">
                GC
              </span>
            )}
            <span className="font-display text-sm font-bold text-[#0B192C]" dir="ltr">
              {BRAND_NAME}
            </span>
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging ? 'border-cyan bg-cyan/10' : 'border-[var(--glass-border)]'
        }`}
      >
        {uploading ? (
          <Loader2 className="animate-spin text-cyan" size={26} />
        ) : (
          <UploadCloud className="text-cyan" size={26} />
        )}
        <p className="text-xs text-[var(--text-secondary)]">
          {uploading ? dict.logoUploading : dict.logoHint}
        </p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white disabled:opacity-70"
        >
          <ImagePlus size={15} />
          {uploading ? dict.uploading : dict.upload}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          disabled={uploading}
          onChange={handleFile}
        />
        {logoUrl ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => void handleRemove()}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-xs font-semibold text-red-400 disabled:opacity-70"
          >
            <Trash2 size={14} />
            {dict.removeLogo}
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default LogoManager
