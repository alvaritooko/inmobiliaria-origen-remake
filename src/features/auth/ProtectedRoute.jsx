import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary-950 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary-400">Cargando...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
