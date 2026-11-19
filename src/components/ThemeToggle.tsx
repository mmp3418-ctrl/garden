import { Moon, Sun } from 'lucide-react'
import type { FC } from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="nav-control touch-target inline-flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-primary)] transition hover:text-cyan"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export default ThemeToggle
