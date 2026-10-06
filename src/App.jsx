import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CVEditor from './pages/CVEditor'
import CVPreview from './pages/CVPreview'
import CoverLetterEditor from './pages/CoverLetterEditor'
import CoverLetterPreview from './pages/CoverLetterPreview'
import ATSCheck from './pages/ATSCheck'
import Pricing from './pages/Pricing'
import AdminDashboard from './pages/AdminDashboard'
import ImportCV from './pages/ImportCV'
import Account from './pages/Account'
import Help from './pages/Help'
import './styles/tokens.css'
import './styles/global.css'

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/resume/:id/edit"
            element={
              <RequireAuth>
                <CVEditor />
              </RequireAuth>
            }
          />
          <Route
            path="/resume/:id/preview"
            element={
              <RequireAuth>
                <CVPreview />
              </RequireAuth>
            }
          />
          <Route
            path="/cover-letter/:id/edit"
            element={
              <RequireAuth>
                <CoverLetterEditor />
              </RequireAuth>
            }
          />
          <Route
            path="/cover-letter/:id/preview"
            element={
              <RequireAuth>
                <CoverLetterPreview />
              </RequireAuth>
            }
          />
          <Route
            path="/resume/:id/ats-check"
            element={
              <RequireAuth>
                <ATSCheck />
              </RequireAuth>
            }
          />
          <Route
            path="/pricing"
            element={
              <RequireAuth>
                <Pricing />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/import-cv"
            element={
              <RequireAuth>
                <ImportCV />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route
            path="/help"
            element={
              <RequireAuth>
                <Help />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
            }
