import type { Language } from '../types'

export function pickLocale(
  language: Language,
  ar: string | null | undefined,
  en: string | null | undefined,
): string {
  const value = language === 'ar' ? ar : en
  const fallback = language === 'ar' ? en : ar
  return value?.trim() || fallback?.trim() || ''
}

export function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0)
}

export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
