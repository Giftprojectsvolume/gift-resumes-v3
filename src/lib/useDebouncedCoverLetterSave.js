import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useDebouncedCoverLetterSave(letterId, delay = 800) {
  const timeoutRef = useRef(null)
  const pendingPatch = useRef({})
  const [status, setStatus] = useState('idle')

  const flush = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const toSave = pendingPatch.current
    if (Object.keys(toSave).length === 0) return
    pendingPatch.current = {}
    setStatus('saving')
    const { error } = await supabase.from('cover_letters').update(toSave).eq('id', letterId)
    setStatus(error ? 'error' : 'saved')
  }, [letterId])

  const save = useCallback(
    (patch) => {
      pendingPatch.current = { ...pendingPatch.current, ...patch }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setStatus('idle')
      timeoutRef.current = setTimeout(flush, delay)
    },
    [flush, delay]
  )

  useEffect(() => {
    return () => {
      if (Object.keys(pendingPatch.current).length > 0) {
        supabase.from('cover_letters').update(pendingPatch.current).eq('id', letterId)
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [letterId])

  return { save, status, flush }
}
