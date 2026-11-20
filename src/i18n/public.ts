import type { Language } from '../types'

export const publicCopy = {
  ar: {
    home: 'الرئيسية',
    about: 'المرافق',
    services: 'الخدمات',
    gallery: 'المعرض',
    contact: 'التواصل',
    cta: 'تواصل معنا',
    rights: 'جميع الحقوق محفوظة.',
    admin: 'لوحة التحكم',
  },
  en: {
    home: 'Home',
    about: 'Facilities',
    services: 'Services',
    gallery: 'Gallery',
    contact: 'Contact',
    cta: 'Contact Us',
    rights: 'All rights reserved.',
    admin: 'Admin',
  },
} as const

export function getPublicCopy(language: Language) {
  return publicCopy[language]
}
