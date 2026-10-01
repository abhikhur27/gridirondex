import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
function subscribe(listener: () => void) {
  const preference = window.matchMedia(query)
  preference.addEventListener('change', listener)
  return () => preference.removeEventListener('change', listener)
}

// Keep playback controls in sync when the OS preference changes during a visit.
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
