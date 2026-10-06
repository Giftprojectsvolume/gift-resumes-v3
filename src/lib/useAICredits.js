import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useAICredits() {
  const [balance, setBalance] = useState(null)

  const refresh = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) return
    const { data } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .eq('credit_type', 'ai_improvement')
      .maybeSingle()
    setBalance(data?.balance ?? 0)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function improveText(text, fieldType) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/improve-wording`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ text, fieldType }),
    })

    const result = await res.json()

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Could not improve this text right now.')
    }

    await refresh()
    return result.improvedText
  }

  return { balance, refresh, improveText }
}
