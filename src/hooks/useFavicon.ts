import { useEffect } from 'react'

const FALLBACK_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%2300A9FF'/%3E%3Cstop offset='1' stop-color='%230047AB'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='url(%23g)'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-family='Arial,sans-serif' font-size='22' font-weight='700' fill='white'%3EGC%3C/text%3E%3C/svg%3E"

/** Keep `<link rel="icon">` in sync with the uploaded logo (or a clean GC fallback). */
export function useFavicon(logoUrl: string | null | undefined): void {
  useEffect(() => {
    const href = logoUrl?.trim() || FALLBACK_FAVICON
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")

    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    if (href.startsWith('data:image/svg')) {
      link.type = 'image/svg+xml'
    } else if (href.endsWith('.svg')) {
      link.type = 'image/svg+xml'
    } else if (/\.jpe?g$/i.test(href)) {
      link.type = 'image/jpeg'
    } else if (/\.webp$/i.test(href)) {
      link.type = 'image/webp'
    } else {
      link.type = 'image/png'
    }

    link.href = href
  }, [logoUrl])
}
