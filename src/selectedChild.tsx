import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentHouseholdId } from './services/authService'
import { listChildren, type Child } from './services/childrenService'
import { DEMO_CHILD_ID } from './services'

/**
 * MBCST-33: resolves which real child (from the real `children` table,
 * MBCST-20) Baby Tracking/Planner logs are currently scoped to, so a
 * household with more than one real child doesn't have their entries
 * silently mixed together under one hardcoded id.
 *
 * Tracking logs themselves (trackingService.ts) are still localStorage-only
 * -- no confirmed real backend table for feed/sleep/diaper entries exists in
 * this workspace to write to yet (unlike `children`, `bookings`,
 * `appointments`). This context only fixes *which child id* the existing
 * local storage is keyed by; it does not make the underlying storage a real
 * backend write. Falls back to DEMO_CHILD_ID when the household has no real
 * children on file yet, preserving the existing demo-persona experience.
 */
interface SelectedChildValue {
  childId: string
  children: Child[]
  setChildId: (id: string) => void
  loading: boolean
}

const SelectedChildContext = createContext<SelectedChildValue>({
  childId: DEMO_CHILD_ID,
  children: [],
  setChildId: () => {},
  loading: false,
})

export function useSelectedChild() {
  return useContext(SelectedChildContext)
}

export function SelectedChildProvider({ children: reactChildren }: { children: ReactNode }) {
  const [childId, setChildId] = useState(DEMO_CHILD_ID)
  const [householdChildren, setHouseholdChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCurrentHouseholdId().then(async householdId => {
      if (!householdId) { if (!cancelled) setLoading(false); return }
      const real = await listChildren(householdId)
      if (cancelled) return
      setHouseholdChildren(real)
      if (real.length > 0) setChildId(real[0].id)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <SelectedChildContext.Provider value={{ childId, children: householdChildren, setChildId, loading }}>
      {reactChildren}
    </SelectedChildContext.Provider>
  )
}
