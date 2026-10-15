import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'dbscan-collapsed-sections'

function readStoredIds(validIds: readonly string[]): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return new Set()
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return new Set()
    }
    const valid = new Set(validIds)
    return new Set(
      parsed.filter((id): id is string => typeof id === 'string' && valid.has(id)),
    )
  } catch {
    // storage unavailable or unreadable: start fully expanded
    return new Set()
  }
}

export type TheoryCollapseControls = {
  isCollapsed: (id: string) => boolean
  toggleSection: (id: string) => void
  expandSections: (ids: readonly string[]) => void
}

export function useCollapsedSections(validIds: readonly string[]): TheoryCollapseControls {
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(() =>
    readStoredIds(validIds),
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsedIds]))
    } catch {
      // storage unavailable: keep the state in memory only
    }
  }, [collapsedIds])

  const isCollapsed = useCallback(
    (id: string) => collapsedIds.has(id),
    [collapsedIds],
  )

  const toggleSection = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expandSections = useCallback((ids: readonly string[]) => {
    setCollapsedIds((prev) => {
      if (ids.every((id) => !prev.has(id))) {
        return prev
      }
      const next = new Set(prev)
      for (const id of ids) {
        next.delete(id)
      }
      return next
    })
  }, [])

  return { isCollapsed, toggleSection, expandSections }
}
