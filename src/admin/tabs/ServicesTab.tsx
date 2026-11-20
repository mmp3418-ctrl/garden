import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState, type FC, type FormEvent } from 'react'
import ServiceIcon, { SERVICE_ICON_OPTIONS } from '../../components/ServiceIcon'
import { OFFICIAL_FACILITIES } from '../../data/officialContent'
import { supabase } from '../../lib/supabase'
import type { ServiceRow } from '../../types'
import { AdminInput, AdminSelect, AdminTextarea } from '../components/AdminField'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onChanged?: () => void
}

type ServiceForm = {
  id?: string
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  icon_name: string
  sort_order: number
}

const emptyForm = (sortOrder: number): ServiceForm => ({
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  icon_name: 'Waves',
  sort_order: sortOrder,
})

const ServicesTab: FC<Props> = ({ dict, onToast, onChanged }) => {
  const [items, setItems] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [drawer, setDrawer] = useState<ServiceForm | null>(null)
  const [inlineId, setInlineId] = useState<string | null>(null)
  const [inlineDraft, setInlineDraft] = useState<ServiceForm | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const load = async (): Promise<void> => {
    setLoading(true)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) {
      onToast({ type: 'error', message: error.message || dict.error })
      setItems([])
    } else {
      setItems((data as ServiceRow[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toForm = (item: ServiceRow): ServiceForm => ({
    id: item.id,
    title_ar: item.title_ar,
    title_en: item.title_en,
    description_ar: item.description_ar ?? '',
    description_en: item.description_en ?? '',
    icon_name: item.icon_name || 'Waves',
    sort_order: item.sort_order ?? 0,
  })

  const persistForm = async (editing: ServiceForm): Promise<void> => {
    if (!editing.title_ar.trim() || !editing.title_en.trim()) {
      onToast({ type: 'error', message: dict.error })
      return
    }
    setSaving(true)
    try {
      const payload = {
        title_ar: editing.title_ar.trim(),
        title_en: editing.title_en.trim(),
        description_ar: editing.description_ar.trim() || null,
        description_en: editing.description_en.trim() || null,
        icon_name: editing.icon_name,
        sort_order: Number(editing.sort_order) || 0,
      }
      const result = editing.id
        ? await supabase.from('services').update(payload).eq('id', editing.id)
        : await supabase.from('services').insert(payload)
      if (result.error) throw new Error(result.error.message)
      setDrawer(null)
      setInlineId(null)
      setInlineDraft(null)
      onToast({ type: 'success', message: dict.saved })
      onChanged?.()
      await load()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm(dict.confirmDelete)) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) {
      onToast({ type: 'error', message: error.message || dict.error })
      return
    }
    onToast({ type: 'success', message: dict.saved })
    onChanged?.()
    await load()
  }

  const swapOrder = async (index: number, direction: -1 | 1): Promise<void> => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const a = items[index]
    const b = items[target]
    if (!a || !b) return
    const updates = await Promise.all([
      supabase.from('services').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('services').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    const failed = updates.find((res) => res.error)
    if (failed?.error) {
      onToast({ type: 'error', message: failed.error.message || dict.error })
      return
    }
    onChanged?.()
    await load()
  }

  const applyReorder = async (from: number, to: number): Promise<void> => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)
    const updates = next.map((item, index) =>
      supabase.from('services').update({ sort_order: index + 1 }).eq('id', item.id),
    )
    const results = await Promise.all(updates)
    const failed = results.find((res) => res.error)
    if (failed?.error) {
      onToast({ type: 'error', message: failed.error.message || dict.error })
      return
    }
    onChanged?.()
    await load()
  }

  const seedDefaults = async (): Promise<void> => {
    if (items.length > 0 && !window.confirm(dict.confirmDelete)) return
    setSeeding(true)
    try {
      if (items.length > 0) {
        const ids = items.map((item) => item.id)
        const { error: delError } = await supabase.from('services').delete().in('id', ids)
        if (delError) throw new Error(delError.message)
      }
      const { error } = await supabase.from('services').insert(OFFICIAL_FACILITIES)
      if (error) throw new Error(error.message)
      onToast({ type: 'success', message: dict.seeded })
      onChanged?.()
      await load()
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setSeeding(false)
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">{dict.loading}</p>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">
          {items.length} {dict.tabs.services}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={seeding}
            onClick={() => void seedDefaults()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 text-sm font-semibold text-cyan disabled:opacity-70"
          >
            <Sparkles size={16} />
            {seeding ? dict.saving : dict.seedFacilities}
          </button>
          <button
            type="button"
            onClick={() =>
              setDrawer(emptyForm(items.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0) + 1))
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white"
          >
            <Plus size={16} />
            {dict.add}
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item, index) => {
          const isInline = inlineId === item.id && inlineDraft
          return (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex === null) return
                void applyReorder(dragIndex, index)
                setDragIndex(null)
              }}
              className="glass rounded-2xl p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    className="mt-1 cursor-grab text-[var(--text-muted)] active:cursor-grabbing"
                    title={dict.dragHandle}
                    aria-label={dict.dragHandle}
                  >
                    <GripVertical size={18} />
                  </button>
                  <div className="inline-flex rounded-xl bg-brand-gradient p-2.5 text-white">
                    <ServiceIcon name={item.icon_name} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isInline ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <AdminInput
                          label="Title AR"
                          value={inlineDraft.title_ar}
                          onChange={(e) => setInlineDraft({ ...inlineDraft, title_ar: e.target.value })}
                          dir="rtl"
                        />
                        <AdminInput
                          label="Title EN"
                          value={inlineDraft.title_en}
                          onChange={(e) => setInlineDraft({ ...inlineDraft, title_en: e.target.value })}
                          dir="ltr"
                        />
                        <AdminTextarea
                          label="Desc AR"
                          value={inlineDraft.description_ar}
                          onChange={(e) =>
                            setInlineDraft({ ...inlineDraft, description_ar: e.target.value })
                          }
                          dir="rtl"
                          rows={2}
                        />
                        <AdminTextarea
                          label="Desc EN"
                          value={inlineDraft.description_en}
                          onChange={(e) =>
                            setInlineDraft({ ...inlineDraft, description_en: e.target.value })
                          }
                          dir="ltr"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="truncate font-bold">{item.title_ar}</p>
                        <p className="truncate text-sm text-[var(--text-muted)]" dir="ltr">
                          {item.title_en}
                        </p>
                        <p className="mt-1 text-xs text-cyan">#{item.sort_order}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isInline ? (
                    <>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void persistForm(inlineDraft)}
                        className="inline-flex min-h-10 items-center rounded-xl bg-brand-gradient px-3 text-xs font-bold text-white"
                      >
                        {dict.save}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineId(null)
                          setInlineDraft(null)
                        }}
                        className="inline-flex min-h-10 items-center rounded-xl border border-[var(--glass-border)] px-3 text-xs font-semibold"
                      >
                        {dict.cancel}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void swapOrder(index, -1)}
                        disabled={index === 0}
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[var(--glass-border)] px-3 text-xs font-semibold disabled:opacity-40"
                      >
                        <ArrowUp size={14} /> {dict.reorderUp}
                      </button>
                      <button
                        type="button"
                        onClick={() => void swapOrder(index, 1)}
                        disabled={index === items.length - 1}
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[var(--glass-border)] px-3 text-xs font-semibold disabled:opacity-40"
                      >
                        <ArrowDown size={14} /> {dict.reorderDown}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineId(item.id)
                          setInlineDraft(toForm(item))
                        }}
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-cyan/30 bg-cyan/10 px-3 text-xs font-semibold text-cyan"
                      >
                        {dict.inlineEdit}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawer(toForm(item))}
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-cyan/30 bg-cyan/10 px-3 text-xs font-semibold text-cyan"
                      >
                        <Pencil size={14} /> {dict.openEditor}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-xs font-semibold text-red-400"
                      >
                        <Trash2 size={14} /> {dict.delete}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {drawer ? (
        <div className="fixed inset-0 z-[85] flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="glass h-full w-full max-w-lg overflow-y-auto border-s border-[var(--glass-border)] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold">{drawer.id ? dict.edit : dict.add}</h3>
              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--glass-border)]"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                void persistForm(drawer)
              }}
              className="space-y-4"
            >
              <AdminInput
                label="Title (AR)"
                value={drawer.title_ar}
                onChange={(e) => setDrawer({ ...drawer, title_ar: e.target.value })}
                dir="rtl"
                required
              />
              <AdminInput
                label="Title (EN)"
                value={drawer.title_en}
                onChange={(e) => setDrawer({ ...drawer, title_en: e.target.value })}
                dir="ltr"
                required
              />
              <AdminTextarea
                label="Description (AR)"
                value={drawer.description_ar}
                onChange={(e) => setDrawer({ ...drawer, description_ar: e.target.value })}
                dir="rtl"
              />
              <AdminTextarea
                label="Description (EN)"
                value={drawer.description_en}
                onChange={(e) => setDrawer({ ...drawer, description_en: e.target.value })}
                dir="ltr"
              />
              <div className="space-y-2">
                <AdminSelect
                  label="Icon"
                  value={drawer.icon_name}
                  onChange={(e) => setDrawer({ ...drawer, icon_name: e.target.value })}
                  options={SERVICE_ICON_OPTIONS.map((name) => ({ value: name, label: name }))}
                />
                <div className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-3 py-2 text-white">
                  <ServiceIcon name={drawer.icon_name} className="h-5 w-5" />
                  <span className="text-xs font-semibold">{drawer.icon_name}</span>
                </div>
              </div>
              <AdminInput
                label="Sort Order"
                type="number"
                value={drawer.sort_order}
                onChange={(e) => setDrawer({ ...drawer, sort_order: Number(e.target.value) || 0 })}
                dir="ltr"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white disabled:opacity-70"
              >
                {saving ? dict.saving : dict.save}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ServicesTab
