import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import { useState, type FC, type FormEvent } from 'react'
import LanguageToggle from '../components/LanguageToggle'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { BRAND_NAME } from '../data/content'
import { getAdminDict } from './i18n'

const AdminLogin: FC = () => {
  const { language } = useLanguage()
  const dict = getAdminDict(language)
  const { loading, signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await signIn(username, password)
    setSubmitting(false)
    if (result.error) setError(dict.invalidCredentials)
  }

  const busy = submitting || loading

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-page px-4 py-10 text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,169,255,0.16),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(0,71,171,0.18),transparent_45%)]" />
      <div className="absolute end-4 top-4 z-10 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="glass relative z-10 w-full max-w-md rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-6 text-center">
          <p className="font-display text-sm font-semibold tracking-wide text-cyan" dir="ltr">
            {BRAND_NAME}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[var(--text-primary)]">
            {dict.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{dict.loginSubtitle}</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <User size={14} /> {dict.username}
            </span>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              dir="ltr"
              disabled={busy}
              className="w-full min-h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-[#00A9FF]/20 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <Lock size={14} /> {dict.password}
            </span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                disabled={busy}
                className="w-full min-h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 pe-20 text-sm outline-none focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-[#00A9FF]/20 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-cyan"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? dict.hidePassword : dict.showPassword}
              </button>
            </div>
          </label>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-70"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? dict.signingIn : dict.signIn}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
