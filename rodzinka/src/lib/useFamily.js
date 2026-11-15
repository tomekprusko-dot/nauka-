import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// "Hook" = kawałek logiki do wielokrotnego użycia w komponentach.
// Ten pobiera: kim jestem w rodzinie (imię), członków rodziny i listę dzieci.
// Filtrowania po rodzinie nie piszemy: baza sama zwraca tylko nasze wiersze (RLS).
export function useFamily(userId) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [members, children] = await Promise.all([
        supabase.from('family_members').select('user_id, display_name, family_id'),
        supabase.from('children').select('*').order('sort_order'),
      ])
      if (cancelled) return

      const error = members.error || children.error
      if (error) {
        setState({ status: 'error', error })
        return
      }
      const me = members.data.find((m) => m.user_id === userId)
      if (!me) {
        setState({ status: 'no-family' })
        return
      }
      setState({
        status: 'ready',
        me,
        familyId: me.family_id,
        members: members.data,
        children: children.data,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  return state
}
