export function toMapEmbedUrl(mapUrl: string | null | undefined): string {
  const raw = (mapUrl ?? '').trim()
  const fallback =
    'https://maps.google.com/maps?q=32.794930,13.134346&z=16&output=embed'
  if (!raw) return fallback
  if (raw.includes('output=embed')) return raw
  const coordMatch = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/)
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=16&output=embed`
  }
  try {
    const url = new URL(raw)
    if (!url.searchParams.has('output')) url.searchParams.set('output', 'embed')
    return url.toString()
  } catch {
    return fallback
  }
}
