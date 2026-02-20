import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch profile with role from profiles table
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data
    }

    useEffect(() => {

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {


                if (session?.user) {
                    setUser(session.user)
                    setLoading(false)

                    // Fetch profile in background (don't block loading)
                    try {
                        const prof = await fetchProfile(session.user.id)

                        setProfile(prof)
                    } catch (err) {
                        console.error('[Auth] Profile fetch error:', err)
                    }
                } else {
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        const timeout = setTimeout(() => {
            setLoading(false)
        }, 3000)



        return () => {
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, [])

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            // Explicitly clear state as a fallback to the listener
            setUser(null)
            setProfile(null)
        } catch (error) {
            console.error('[Auth] Logout error:', error)
            // Still clear local state on error to unblock UI
            setUser(null)
            setProfile(null)
            throw error
        }
    }

    const isAdmin = profile?.role === 'admin'
    const isAgent = profile?.role === 'agent'

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signIn,
            signOut,
            isAdmin,
            isAgent,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
