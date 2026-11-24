import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react'
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  matchesDefaultCredentials,
} from '../lib/adminAuth'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'gc_admin_session'

interface AdminSession {
  username: string
  loggedInAt: string
}

interface AuthContextValue {
  session: AdminSession | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    if (!parsed?.username || !parsed?.loggedInAt) return null
    return parsed
  } catch {
    return null
  }
}

function persistSession(session: AdminSession | null): void {
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY)
    return
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Accepts:
 * 1) Built-in / env defaults (`admin` / `20262026`)
 * 2) Credentials stored in Supabase `admin_credentials` (id = 1)
 */
async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const user = username.trim()
  const pass = password

  if (!user || !pass) return false

  // Always allow configured defaults so login never bricks
  if (matchesDefaultCredentials(user, pass)) return true

  try {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('username, password')
      .eq('id', 1)
      .maybeSingle()

    if (!error && data) {
      const dbUser = String((data as { username?: string }).username ?? '').trim()
      const dbPass = String((data as { password?: string }).password ?? '')
      if (dbUser && dbPass && dbUser === user && dbPass === pass) {
        return true
      }
    }
  } catch {
    /* ignore — defaults already checked above */
  }

  return false
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSession(readStoredSession())
    setLoading(false)
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    const ok = await verifyCredentials(username, password)
    if (!ok) {
      return { error: 'invalid' }
    }
    const next: AdminSession = {
      username: username.trim() || DEFAULT_ADMIN_USERNAME,
      loggedInAt: new Date().toISOString(),
    }
    persistSession(next)
    setSession(next)
    return { error: null }
  }, [])

  const signOut = useCallback(() => {
    persistSession(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, loading, signIn, signOut }),
    [session, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Re-export defaults for admin UI that needs the known username seed
export { DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD }
