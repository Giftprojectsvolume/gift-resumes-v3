import { useEffect, useState } from 'react'

export const A4_WIDTH = 794
export const A4_HEIGHT = 1123

export function useA4Preview(containerRef, contentRef) {
  const [scale, setScale] = useState(1)
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT)

  useEffect(() => {
    function recalcScale() {
      if (!containerRef.current) return
      const availableWidth = containerRef.current.clientWidth
      setScale(Math.min(1, availableWidth / A4_WIDTH))
    }
    recalcScale()
    window.addEventListener('resize', recalcScale)
    return () => window.removeEventListener('resize', recalcScale)
  }, [containerRef])

  useEffect(() => {
    if (!contentRef.current) return
    const el = contentRef.current
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [contentRef])

  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT))

  return { scale, contentHeight, pageCount }
}
