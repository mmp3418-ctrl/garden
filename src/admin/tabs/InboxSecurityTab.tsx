import { CheckCheck, Lock, Mail, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FC, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { ContactMessage } from '../../types'
import { AdminInput } from '../components/AdminField'
import type { ToastState } from '../components/AdminToast'
import type { AdminDictionary } from '../i18n'

interface Props {
  dict: AdminDictionary
  onToast: (toast: ToastState) => void
  onChanged?: () => void
}

type Filter = 'all' | 'unread'

const InboxSecurityTab: FC<Props> = ({ dict, onToast, onChanged }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [savingCreds, setSavingCreds] = useState(false)

  const load = async (): Promise<void> => {
    setLoading(true)
    const [messagesRes, credsRes] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_credentials').select('username').eq('id', 1).maybeSingle(),
    ])

    if (messagesRes.error) {
      onToast({ type: 'error', message: messagesRes.error.message || dict.error })
      setMessages([])
    } else {
      setMessages((messagesRes.data as ContactMessage[]) ?? [])
    }

    if (!credsRes.error && credsRes.data) {
      const u = String((credsRes.data as { username?: string }).username ?? '').trim()
      if (u) setUsername(u)
    }

    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    if (filter === 'unread') return messages.filter((m) => !m.is_read)
    return messages
  }, [filter, messages])

  const toggleRead = async (message: ContactMessage): Promise<void> => {
    const next = !(message.is_read ?? false)
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: next })
      .eq('id', message.id)
    if (error) {
      onToast({ type: 'error', message: error.message || dict.error })
      return
    }
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: next } : m)))
    onChanged?.()
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm(dict.confirmDelete)) return
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (error) {
      onToast({ type: 'error', message: error.message || dict.error })
      return
    }
    setMessages((prev) => prev.filter((m) => m.id !== id))
    onToast({ type: 'success', message: dict.saved })
    onChanged?.()
  }

  const handleUpdateCredentials = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (!username.trim() || !password) {
      onToast({ type: 'error', message: dict.error })
      return
    }
    if (password !== confirm) {
      onToast({ type: 'error', message: dict.passwordMismatch })
      return
    }

    setSavingCreds(true)
    try {
      const payload = {
        id: 1,
        username: username.trim(),
        password,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('admin_credentials').upsert(payload)
      if (error) throw new Error(error.message)
      setPassword('')
      setConfirm('')
      onToast({ type: 'success', message: dict.credentialsUpdated })
    } catch (err) {
      onToast({ type: 'error', message: err instanceof Error ? err.message : dict.error })
    } finally {
      setSavingCreds(false)
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">{dict.loading}</p>

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Mail size={18} className="text-cyan" />
            Inbox
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                filter === 'all' ? 'bg-brand-gradient text-white' : 'glass text-[var(--text-secondary)]'
              }`}
            >
              {dict.filterAll}
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                filter === 'unread' ? 'bg-brand-gradient text-white' : 'glass text-[var(--text-secondary)]'
              }`}
            >
              {dict.filterUnread}
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
            {dict.noMessages}
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((message) => {
              const read = Boolean(message.is_read)
              return (
                <li
                  key={message.id}
                  className={`glass rounded-2xl p-4 sm:p-5 ${read ? 'opacity-80' : 'border-cyan/25'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{message.full_name}</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]" dir="ltr">
                        {message.email}
                        {message.phone ? ` · ${message.phone}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]" dir="ltr">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        read ? 'bg-white/10 text-[var(--text-muted)]' : 'bg-cyan/15 text-cyan'
                      }`}
                    >
                      {read ? 'Read' : 'New'}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                    {message.message}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleRead(message)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/10 px-3 text-xs font-semibold text-cyan"
                    >
                      <CheckCheck size={14} />
                      {read ? dict.markUnread : dict.markRead}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(message.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-xs font-semibold text-red-400"
                    >
                      <Trash2 size={14} />
                      {dict.delete}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <form onSubmit={(e) => void handleUpdateCredentials(e)} className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-bold">
          <Lock size={18} className="text-cyan" />
          {dict.securityTitle}
        </h3>
        <p className="mb-4 text-sm text-[var(--text-muted)]">{dict.securityHint}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminInput
            label={dict.newUsername}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            dir="ltr"
            autoComplete="username"
            required
          />
          <div className="hidden md:block" />
          <AdminInput
            label={dict.newPassword}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            autoComplete="new-password"
            required
          />
          <AdminInput
            label={dict.confirmPassword}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            dir="ltr"
            autoComplete="new-password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={savingCreds}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white disabled:opacity-70"
        >
          {savingCreds ? dict.saving : dict.updateCredentials}
        </button>
      </form>
    </div>
  )
}

export default InboxSecurityTab
