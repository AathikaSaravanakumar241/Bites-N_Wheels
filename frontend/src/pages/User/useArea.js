import { useCallback, useEffect, useState } from 'react'
import { get } from '../../api.js'
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
    }
    setAreaState(next)
    window.dispatchEvent(new Event(EVENT))
  }, [])
  return { area, setArea }
}
export function fetchStations() {
  return get('/api/v1/stations', false).then((d) => (Array.isArray(d) ? d : []))
}
