import { useCallback, useEffect, useState } from 'react'
import { seedGallery, seedServices } from '../data/seedContent'
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

async function fetchSiteData(): Promise<SiteData> {
  const [settingsRes, servicesRes, galleryRes] = await Promise.all([
    supabase.from('site_settings').select('*').order('id', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('services').select('*').order('sort_order', { ascending: true }),
    supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
  ])

  if (settingsRes.error) {
    console.warn('[useSiteData] site_settings:', settingsRes.error.message)
  }
  if (servicesRes.error) {
    console.warn('[useSiteData] services:', servicesRes.error.message)
  }
  if (galleryRes.error) {
    console.warn('[useSiteData] gallery_items:', galleryRes.error.message)
  }

  const settings = mergeSettings((settingsRes.data as SiteSettings | null) ?? null)

  const services =
    !servicesRes.error && Array.isArray(servicesRes.data) && servicesRes.data.length > 0
      ? (servicesRes.data as ServiceRow[])
      : seedServices

  const gallery =
    !galleryRes.error && Array.isArray(galleryRes.data) && galleryRes.data.length > 0
      ? (galleryRes.data as GalleryItem[])
      : seedGallery

  return { settings, services, gallery }
}

export function useSiteData(): SiteDataState {
  const [data, setData] = useState<SiteData>({
    settings: mergeSettings(null),
    services: seedServices,
    gallery: seedGallery,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetchSiteData()
      setData(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load site data'
      setError(message)
      setData({
        settings: mergeSettings(null),
        services: seedServices,
        gallery: seedGallery,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    ...data,
    loading,
    error,
    refresh,
  }
}
