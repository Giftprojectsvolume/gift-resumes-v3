import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CVEditor from './pages/CVEditor'
import CVPreview from './pages/CVPreview'
import Placeholder from './components/Placeholder'
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
            path="/account"
            element={
              <RequireAuth>
                <Placeholder title="Account / Profile" />
              </RequireAuth>
            }
          />
          <Route
            path="/help"
            element={
              <RequireAuth>
                <Placeholder title="Help" message="Support details will go here." />
              </RequireAuth>
            }
          />
          <Route
            path="/pricing"
            element={
              <RequireAuth>
                <Placeholder title="Pricing" message="The pricing page comes after the core CV builder is working." />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
