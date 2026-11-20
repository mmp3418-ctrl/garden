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
import type { ServiceCategory, ServiceRow } from '../../types'
import { AdminInput, AdminTextarea } from '../components/AdminField'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'

interface Props {
  dict: AdminDictionary
  category: ServiceCategory
  onToast: (toast: ToastState) => void
  onChanged?: () => void
}

type ItemForm = {
  id?: string
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  icon_name: string
  sort_order: number
}

const emptyForm = (sortOrder: number, defaultIcon: string): ItemForm => ({
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  icon_name: defaultIcon,
  sort_order: sortOrder,
})

function matchesCategory(row: ServiceRow, category: ServiceCategory): boolean {
  const value = (row.category ?? '').trim().toLowerCase()
  if (category === 'recreation') {
    return value === 'recreation' || value === '' || value === 'null'
  }
  return value === 'service'
}

const CatalogTab: FC<Props> = ({ dict, category, onToast, onChanged }) => {
  const [items, setItems] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [drawer, setDrawer] = useState<ItemForm | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const defaultIcon = category === 'recreation' ? 'Waves' : 'Sparkles'
  const sectionTitle = category === 'recreation' ? dict.tabs.facilities : dict.tabs.services
  const emptyLabel = category === 'recreation' ? dict.noFacilities : dict.noServices

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
      const rows = ((data as ServiceRow[]) ?? []).filter((row) => matchesCategory(row, category))
      setItems(rows)

      // Backfill missing category for legacy recreation rows
      if (category === 'recreation') {
        const legacy = rows.filter((row) => !(row.category ?? '').trim())
        if (legacy.length > 0) {
          await Promise.all(
            legacy.map((row) =>
              supabase.from('services').update({ category: 'recreation' }).eq('id', row.id),
            ),
          )
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const toForm = (item: ServiceRow): ItemForm => ({
    id: item.id,
    title_ar: item.title_ar,
    title_en: item.title_en,
    description_ar: item.description_ar ?? '',
    description_en: item.description_en ?? '',
    icon_name: item.icon_name || defaultIcon,
    sort_order: item.sort_order ?? 0,
  })

  const persistForm = async (editing: ItemForm): Promise<void> => {
    if (!editing.title_ar.trim() || !editing.title_en.trim()) {
      onToast({ type: 'error', message: dict.error })
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title_ar: editing.title_ar.trim(),
        title_en: editing.title_en.trim(),
        description_ar: editing.description_ar.trim() || null,
        description_en: editing.description_en.trim() || null,
        icon_name: editing.icon_name,
        category,
        sort_order: Number(editing.sort_order) || 0,
      }
      let result = editing.id
        ? await supabase.from('services').update(payload).eq('id', editing.id)
        : await supabase.from('services').insert(payload)

      // If category column is missing, retry without it (recreation-only fallback)
      if (result.error && /category/i.test(result.error.message)) {
        if (category !== 'recreation') {
          throw new Error(
            'Missing services.category column. Run supabase_schema.sql to enable Services.',
          )
        }
        delete payload.category
        result = editing.id
          ? await supabase.from('services').update(payload).eq('id', editing.id)
          : await supabase.from('services').insert(payload)
      }
      if (result.error) throw new Error(result.error.message)
      setDrawer(null)
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
    const results = await Promise.all(
      next.map((item, index) =>
        supabase.from('services').update({ sort_order: index + 1 }).eq('id', item.id),
      ),
    )
    const failed = results.find((res) => res.error)
    if (failed?.error) {
      onToast({ type: 'error', message: failed.error.message || dict.error })
      return
    }
    onChanged?.()
    await load()
  }

  const seedDefaults = async (): Promise<void> => {
    if (category !== 'recreation') return
    if (items.length > 0 && !window.confirm(dict.confirmDelete)) return
    setSeeding(true)
    try {
      if (items.length > 0) {
        const { error: delError } = await supabase
          .from('services')
          .delete()
          .in(
            'id',
            items.map((item) => item.id),
          )
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

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{sectionTitle}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {items.length} · {dict.bilingualHint}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {category === 'recreation' ? (
            <button
              type="button"
              disabled={seeding}
              onClick={() => void seedDefaults()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 text-sm font-semibold text-cyan disabled:opacity-70"
            >
              <Sparkles size={16} />
              {seeding ? dict.saving : dict.seedFacilities}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() =>
              setDrawer(
                emptyForm(
                  items.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0) + 1,
                  defaultIcon,
                ),
              )
            }
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white"
          >
            <Plus size={16} />
            {dict.add}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
          {emptyLabel}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
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
              className="glass flex flex-col rounded-2xl p-4 sm:p-5"
            >
              <div className="mb-4 flex items-start gap-3">
                <button
                  type="button"
                  className="mt-1 cursor-grab text-[var(--text-muted)] active:cursor-grabbing"
                  title={dict.dragHandle}
                  aria-label={dict.dragHandle}
                >
                  <GripVertical size={18} />
                </button>
                <div className="inline-flex rounded-xl bg-brand-gradient p-3 text-white">
                  <ServiceIcon name={item.icon_name} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-6 text-[var(--text-primary)]">{item.title_ar}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]" dir="ltr">
                    {item.title_en}
                  </p>
                  {item.description_ar ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {item.description_ar}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--glass-border)] pt-3">
                <button
                  type="button"
                  onClick={() => void swapOrder(index, -1)}
                  disabled={index === 0}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-[var(--glass-border)] px-3 text-xs font-semibold disabled:opacity-40"
                >
                  <ArrowUp size={14} /> {dict.reorderUp}
                </button>
                <button
                  type="button"
                  onClick={() => void swapOrder(index, 1)}
                  disabled={index === items.length - 1}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-[var(--glass-border)] px-3 text-xs font-semibold disabled:opacity-40"
                >
                  <ArrowDown size={14} /> {dict.reorderDown}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawer(toForm(item))}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-cyan/30 bg-cyan/10 px-3 text-xs font-semibold text-cyan"
                >
                  <Pencil size={14} /> {dict.edit}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-xs font-semibold text-red-400"
                >
                  <Trash2 size={14} /> {dict.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {drawer ? (
        <div className="fixed inset-0 z-[85] flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="glass h-full w-full max-w-lg overflow-y-auto border-s border-[var(--glass-border)] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold">{drawer.id ? dict.edit : dict.add}</h3>
              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--glass-border)]"
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

              <div>
                <p className="mb-2 text-sm font-semibold text-[var(--text-muted)]">{dict.iconPicker}</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {SERVICE_ICON_OPTIONS.map((name) => {
                    const active = drawer.icon_name === name
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setDrawer({ ...drawer, icon_name: name })}
                        className={`inline-flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border px-2 text-[10px] font-semibold transition ${
                          active
                            ? 'border-cyan bg-brand-gradient text-white'
                            : 'border-[var(--glass-border)] text-[var(--text-secondary)]'
                        }`}
                        title={name}
                      >
                        <ServiceIcon name={name} className="h-5 w-5" />
                        <span className="truncate">{name}</span>
                      </button>
                    )
                  })}
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
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white disabled:opacity-70"
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

export default CatalogTab
