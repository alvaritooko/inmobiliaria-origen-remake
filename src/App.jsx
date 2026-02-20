import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import Properties from './pages/Properties'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'

const Placeholder = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-primary-50">
    <h1 className="text-4xl font-display font-light text-primary-900 tracking-tight lowercase first-letter:uppercase">{title}</h1>
  </div>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#fdfdfd]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/propiedad/:id" element={<PropertyDetail />} />
            <Route path="/propiedades" element={<Properties />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'agent']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
