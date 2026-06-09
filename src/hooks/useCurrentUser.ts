'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface CurrentUser {
  user: User | null
  role: string
  name: string
  id: string
  loading: boolean
}

export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({
    user: null, role: '', name: '', id: '', loading: true
  })

  useEffect(() => {

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState({ user: null, role: '', name: '', id: '', loading: false })
        return
      }
      const { data: profile } = await supabase
        .from('mktplace_feira_profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      setState({
        user,
        role: profile?.role || user.user_metadata?.role || 'cliente',
        name: profile?.full_name || user.user_metadata?.full_name || user.email || '',
        id: user.id,
        loading: false
      })
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      init()
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
