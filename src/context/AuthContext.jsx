import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('[Auth] Profile fetch error:', error.code, error.message)
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertErr } = await supabase
            .from('profiles')
            .insert({ id: userId, role: 'musteri' })
            .select()
            .single()
          if (!insertErr) return newProfile
        }
        return null
      }
      return data
    } catch (err) {
      console.warn('[Auth] fetchProfile exception:', err)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    // 1) İlk session'ı al
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)

      if (s?.user) {
        fetchProfile(s.user.id).then((p) => {
          if (!mounted) return
          setProfile(p)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    // 2) Sonraki değişiklikleri dinle (async DEĞİL — deadlock önlenir)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        if (!mounted) return
        setSession(s)

        if (s?.user) {
          // .then ile çağır, await kullanma
          fetchProfile(s.user.id).then((p) => {
            if (mounted) setProfile(p)
          })
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    setProfile(null)
  }

  const value = useMemo(() => {
    const role = profile?.role || null
    return {
      session,
      profile,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!session,
      role,
      isCustomer: role === 'musteri',
      isStaff: role === 'personel',
      isAdmin: role === 'admin',
      isModerator: role === 'moderator',
      isDepocu: role === 'depocu',
      isStaffOrAdmin: role === 'personel' || role === 'admin' || role === 'depocu',
      canViewAllJobs: role === 'personel' || role === 'admin' || role === 'moderator' || role === 'depocu',
      canEditJobs: role === 'personel' || role === 'admin' || role === 'depocu',
      canManagePaper: role === 'admin' || role === 'depocu',
      canViewPrice: role === 'admin' || role === 'moderator',
    }
  }, [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
