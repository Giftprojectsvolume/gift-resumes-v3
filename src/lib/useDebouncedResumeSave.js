import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useDebouncedResumeSave(resumeId, delay = 800) {
  const timeoutRef = useRef(null)
  const pendingPatch = useRef({})
  const [status, setStatus] = useState('idle') // idle | saving | saved | error

  const flush = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const toSave = pendingPatch.current
    if (Object.keys(toSave).length === 0) return
    pendingPatch.current = {}
    setStatus('saving')
    const { error } = await supabase.from('resumes').update(toSave).eq('id', resumeId)
    setStatus(error ? 'error' : 'saved')
  }, [resumeId])

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
        supabase.from('resumes').update(pendingPatch.current).eq('id', resumeId)
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [resumeId])

  return { save, status, flush }
}
