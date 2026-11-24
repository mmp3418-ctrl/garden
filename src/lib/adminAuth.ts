/** Default admin credentials — overridable via Vite env. */
export const DEFAULT_ADMIN_USERNAME =
  (import.meta.env.VITE_ADMIN_USERNAME as string | undefined)?.trim() || 'admin'

export const DEFAULT_ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || '20262026'

export function matchesDefaultCredentials(username: string, password: string): boolean {
  return username.trim() === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD
}
