import type {
  FC,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/** text-base (16px) prevents iOS zoom; min-h 44px for comfortable taps */
const baseClass =
  'w-full min-h-[44px] rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--glass-border-hover)] focus:ring-2 focus:ring-[#00A9FF]/20'

const FieldShell: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
)

export const AdminInput: FC<InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({
  label,
  className = '',
  ...props
}) => (
  <FieldShell label={label}>
    <input className={`${baseClass} ${className}`} {...props} />
  </FieldShell>
)

export const AdminTextarea: FC<TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({
  label,
  className = '',
  ...props
}) => (
  <FieldShell label={label}>
    <textarea className={`${baseClass} min-h-28 resize-y leading-7 ${className}`} {...props} />
  </FieldShell>
)

export const AdminSelect: FC<
  SelectHTMLAttributes<HTMLSelectElement> & {
    label: string
    options: Array<{ value: string; label: string }>
  }
> = ({ label, options, className = '', ...props }) => (
  <FieldShell label={label}>
    <select className={`${baseClass} ${className}`} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </FieldShell>
)
