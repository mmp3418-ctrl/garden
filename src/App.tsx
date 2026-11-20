import type { FC } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './admin/AdminDashboard'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'

/**
 * Admin-only app entry.
 * `/` and every path render the Admin Login (when logged out)
 * or the full Admin Dashboard (when `gc_admin_session` is valid).
 */
const App: FC = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
)

export default App
