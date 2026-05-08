import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import Upload from './pages/Upload'
import AIAssistant from './pages/AIAssistant'
import QRAccess from './pages/QRAccess'
import Marketplace from './pages/Marketplace'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="upload" element={<Upload />} />
          <Route path="ai" element={<AIAssistant />} />
          <Route path="access" element={<QRAccess />} />
          <Route path="marketplace" element={<Marketplace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
