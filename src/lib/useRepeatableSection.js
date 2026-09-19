import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useRepeatableSection(resumeId, table, emptyRow = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('idle')
  const debounceMap = useRef(new Map())

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('resume_id', resumeId)
      .order('sort_order', { ascending: true })
    if (!error && data) setRows(data)
    setLoading(false)
  }, [resumeId, table])

  useEffect(() => {
    load()
  }, [load])

  const addRow = useCallback(
    async (overrides = {}) => {
      const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0
      const { data, error } = await supabase
        .from(table)
        .insert({ resume_id: resumeId, sort_order: nextOrder, ...emptyRow, ...overrides })
        .select()
        .single()
      if (!error && data) setRows((prev) => [...prev, data])
      return data
    },
    [resumeId, table, rows, emptyRow]
  )

  const flushRow = useCallback(
    async (rowId) => {
      const entry = debounceMap.current.get(rowId)
      if (!entry) return
      if (entry.timeout) clearTimeout(entry.timeout)
      debounceMap.current.delete(rowId)
      if (Object.keys(entry.patch).length === 0) return
      setStatus('saving')
      const { error } = await supabase.from(table).update(entry.patch).eq('id', rowId)
      setStatus(error ? 'error' : 'saved')
    },
    [table]
  )

  const updateRow = useCallback(
    (rowId, patch, delay = 800) => {
      setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
      const existing = debounceMap.current.get(rowId) || { timeout: null, patch: {} }
      existing.patch = { ...existing.patch, ...patch }
      if (existing.timeout) clearTimeout(existing.timeout)
      existing.timeout = setTimeout(() => flushRow(rowId), delay)
      debounceMap.current.set(rowId, existing)
    },
    [flushRow]
  )

  const deleteRow = useCallback(
    async (rowId) => {
      debounceMap.current.delete(rowId)
      const { error } = await supabase.from(table).delete().eq('id', rowId)
      if (!error) setRows((prev) => prev.filter((r) => r.id !== rowId))
      return !error
    },
    [table]
  )

  const moveRow = useCallback(
    (rowId, direction) => {
      const index = rows.findIndex((r) => r.id === rowId)
      const swapWith = direction === 'up' ? index - 1 : index + 1
      if (index === -1 || swapWith < 0 || swapWith >= rows.length) return

      const a = rows[index]
      const b = rows[swapWith]
      const aNewOrder = b.sort_order
      const bNewOrder = a.sort_order

      setRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === a.id) return { ...r, sort_order: aNewOrder }
          if (r.id === b.id) return { ...r, sort_order: bNewOrder }
          return r
        })
        return next.sort((x, y) => x.sort_order - y.sort_order)
      })

      supabase.from(table).update({ sort_order: aNewOrder }).eq('id', a.id)
      supabase.from(table).update({ sort_order: bNewOrder }).eq('id', b.id)
    },
    [rows, table]
  )

  useEffect(() => {
    return () => {
      debounceMap.current.forEach((entry, rowId) => {
        if (entry.timeout) clearTimeout(entry.timeout)
        if (Object.keys(entry.patch).length > 0) {
          supabase.from(table).update(entry.patch).eq('id', rowId)
        }
      })
    }
  }, [table])

  return { rows, loading, status, addRow, updateRow, deleteRow, moveRow }
}
