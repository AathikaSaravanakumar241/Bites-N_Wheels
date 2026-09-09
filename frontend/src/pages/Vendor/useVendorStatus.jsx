import { useCallback, useEffect, useState } from 'react'

/* ---------------------------------------------------------------
   Shared vendor profile + open/closed flag.

   Deliberately NOT a React context: App.jsx has no vendor provider
   and every vendor page is routed independently, so this is a tiny
   localStorage-backed store with a pub/sub so the sidebar and the
   profile page stay in sync without one.

   Replace read/write with GET/PUT /api/trucks/{id} when the backend
   exposes a truck profile endpoint.
   --------------------------------------------------------------- */

const PROFILE_KEY = 'bnw_vendor_profile'
const OPEN_KEY = 'bnw_vendor_open'
const EVENT = 'bnw-vendor-change'

export const DEFAULT_PROFILE = {
  truckName: 'Roll Rickshaw',
  tagline: 'Street-style rolls and momos, made to order',
  cuisine: 'North Indian',
  spice: 'Medium',
  vegOnly: false,
  phone: '9000000000',
  parkedAt: 'IIT Madras Gate, Guindy',
  opensAt: '16:00',
  closesAt: '23:00',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage blocked - state still works for this page view */
  }
  // Defer so this never fires synchronously during a React render/event handler,
  // which would cause "Cannot update a component while rendering a different component".
  setTimeout(() => window.dispatchEvent(new Event(EVENT)), 0)
}

export function useVendorStatus() {
  const [profile, setProfileState] = useState(() => ({
    ...DEFAULT_PROFILE,
    ...read(PROFILE_KEY, {}),
  }))
  const [isOpen, setIsOpenState] = useState(() => read(OPEN_KEY, true))

  // Re-read whenever another component (or another tab) changes it.
  useEffect(() => {
    const sync = () => {
      setProfileState({ ...DEFAULT_PROFILE, ...read(PROFILE_KEY, {}) })
      setIsOpenState(read(OPEN_KEY, true))
    }
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setProfile = useCallback((next) => {
    setProfileState((current) => {
      const merged = typeof next === 'function' ? next(current) : { ...current, ...next }
      write(PROFILE_KEY, merged)
      return merged
    })
  }, [])

  const setIsOpen = useCallback((value) => {
    setIsOpenState(value)
    write(OPEN_KEY, value)
  }, [])

  return { profile, setProfile, isOpen, setIsOpen }
}
