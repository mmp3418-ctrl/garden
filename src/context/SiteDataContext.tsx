import { createContext, useContext, type FC, type ReactNode } from 'react'
import { useSiteData, type SiteData } from '../hooks/useSiteData'

interface SiteContextValue extends SiteData {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const SiteDataContext = createContext<SiteContextValue | null>(null)

export const SiteDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const value = useSiteData()
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSite must be used within SiteDataProvider')
  return ctx
}
