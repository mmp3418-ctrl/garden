import { useCallback, useEffect, useState } from 'react'
import { officialSettingsDefaults, OFFICIAL_FACILITIES } from '../data/officialContent'
import { supabase } from '../lib/supabase'
import type { GalleryItem, ServiceRow, SiteSettings } from '../types'
import { mergeSettings } from '../utils/siteSettings'

export interface SiteData {
  settings: SiteSettings
  services: ServiceRow[]
  gallery: GalleryItem[]
}

interface SiteDataState extends SiteData {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const seedServices: ServiceRow[] = OFFICIAL_FACILITIES.map((item, index) => ({
  id: `seed-${index + 1}`,
  title_ar: item.title_ar,
  title_en: item.title_en,
  description_ar: item.description_ar,
  description_en: item.description_en,
  icon_name: item.icon_name,
  image_url: null,
  category: item.category ?? 'recreation',
  sort_order: item.sort_order,
  created_at: new Date().toISOString(),
}))

async function fetchSiteData(): Promise<SiteData> {
  const [settingsRes, servicesRes, galleryRes] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('services').select('*').order('sort_order', { ascending: true }),
    supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
  ])

  let settingsRow = settingsRes.data as SiteSettings | null
  if (!settingsRow) {
    const fallback = await supabase
      .from('site_settings')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()
    settingsRow = (fallback.data as SiteSettings | null) ?? null
  }

  const settings = mergeSettings(settingsRow)
  const services =
    !servicesRes.error && Array.isArray(servicesRes.data) && servicesRes.data.length > 0
      ? (servicesRes.data as ServiceRow[])
      : seedServices
  const gallery =
    !galleryRes.error && Array.isArray(galleryRes.data) ? (galleryRes.data as GalleryItem[]) : []

  return { settings, services, gallery }
}

export function useSiteData(): SiteDataState {
  const [data, setData] = useState<SiteData>({
    settings: mergeSettings(officialSettingsDefaults),
    services: seedServices,
    gallery: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    setError(null)
    try {
      setData(await fetchSiteData())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load site data')
      setData({
        settings: mergeSettings(officialSettingsDefaults),
        services: seedServices,
        gallery: [],
      })
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const channel = supabase
      .channel('site_settings_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          void refresh({ silent: true })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return { ...data, loading, error, refresh }
}
