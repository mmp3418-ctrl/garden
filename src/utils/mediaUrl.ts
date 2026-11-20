/** Append or refresh a `?v=` cache-buster so logo/hero previews never stick to an old file. */
export function withCacheBust(
  url: string | null | undefined,
  version?: number | string,
): string {
  const raw = (url ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw

  try {
    // Relative paths like `/logo.png`
    if (raw.startsWith('/')) {
      const v = version ?? Date.now()
      const cleaned = raw.replace(/([?&])v=[^&]*/g, '$1').replace(/[?&]$/, '')
      return `${cleaned}${cleaned.includes('?') ? '&' : '?'}v=${v}`.replace(/\?&/, '?')
    }

    const parsed = new URL(raw)
    parsed.searchParams.delete('v')
    parsed.searchParams.set('v', String(version ?? Date.now()))
    return parsed.toString()
  } catch {
    const cleaned = raw.replace(/([?&])v=[^&]*/g, '').replace(/[?&]$/, '')
    const sep = cleaned.includes('?') ? '&' : '?'
    return `${cleaned}${sep}v=${version ?? Date.now()}`
  }
}

/** Normalize a pasted logo path/URL for storage (strip cache buster, trim). */
export function normalizeLogoUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  try {
    if (trimmed.startsWith('/')) {
      return trimmed.split('?')[0] || null
    }
    const parsed = new URL(trimmed)
    parsed.searchParams.delete('v')
    return parsed.toString()
  } catch {
    return trimmed.split('?')[0] || null
  }
}
