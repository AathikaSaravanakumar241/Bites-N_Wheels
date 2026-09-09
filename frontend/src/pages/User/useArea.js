import { useCallback, useEffect, useState } from 'react'
import { get } from '../../api.js'

/* ---------------------------------------------------------------
   SELECTED AREA

   The customer picks an area (station) first; everything they see
   afterwards is scoped to trucks scheduled at that area today.

   Stored in localStorage rather than a context so no provider has to
   be added to App.jsx, and so the choice survives a refresh. A tiny
   pub/sub keeps the header picker and the page body in sync.
   --------------------------------------------------------------- */

const AREA_KEY = 'bnw_area'
const EVENT = 'bnw-area-change'

function read() {
  try {
    const raw = localStorage.getItem(AREA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useArea() {
  const [area, setAreaState] = useState(read)

  useEffect(() => {
    const sync = () => setAreaState(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setArea = useCallback((next) => {
    try {
      if (next) localStorage.setItem(AREA_KEY, JSON.stringify(next))
      else localStorage.removeItem(AREA_KEY)
    } catch {
      /* storage blocked - selection just won't persist */
    }
    setAreaState(next)
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return { area, setArea }
}

/** Every area the customer can choose from. */
export function fetchStations() {
  return get('/api/v1/stations', false).then((d) => (Array.isArray(d) ? d : []))
}
