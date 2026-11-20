export type ServiceCategory = 'recreation' | 'service'

export interface SiteSettings {
  id: string | number
  hero_title_ar: string | null
  hero_title_en: string | null
  hero_subtitle_ar: string | null
  hero_subtitle_en: string | null
  main_heading_ar: string | null
  main_heading_en: string | null
  complex_overview_ar: string | null
  complex_overview_en: string | null
  facilities_heading_ar: string | null
  facilities_heading_en: string | null
  facilities_intro_ar: string | null
  facilities_intro_en: string | null
  about_ar: string | null
  about_en: string | null
  vision_ar: string | null
  vision_en: string | null
  mission_ar: string | null
  mission_en: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address_ar: string | null
  address_en: string | null
  map_url: string | null
  hero_image_url: string | null
  logo_url: string | null
  updated_at: string
}

export interface ServiceRow {
  id: string
  title_ar: string
  title_en: string
  description_ar: string | null
  description_en: string | null
  icon_name: string | null
  image_url: string | null
  category: ServiceCategory | string | null
  sort_order: number
  created_at: string
}

export interface GalleryItem {
  id: string
  title_ar: string | null
  title_en: string | null
  category_ar: string | null
  category_en: string | null
  image_url: string | null
  sort_order: number | null
  created_at: string
}

export interface ContactMessage {
  id: string
  full_name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean | null
  created_at: string
}

export type ContactMessageInsert = {
  full_name: string
  email: string
  phone?: string | null
  message: string
}
