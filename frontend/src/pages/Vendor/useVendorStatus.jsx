import { useCallback, useEffect, useRef, useState } from 'react'
import { get as apiGet, put as apiPut, patch as apiPatch } from '../../api.js'
import { getSession, setSession } from '../../session.js'

/* ---------------------------------------------------------------
   Shared vendor profile + open/closed flag, backed by the truck row.

   Reads GET /api/v1/truck/me, writes PUT /api/v1/truck/me and
   PATCH /api/v1/truck/me/status. The backend resolves which truck
   from the JWT, so no id is passed.

   Still deliberately NOT a React context: App.jsx has no vendor
   provider and every vendor page is routed independently, so this
   stays a tiny store with a pub/sub to keep the sidebar and the
   profile page in sync.

   The cache is per-tab sessionStorage (see session.js) so the sidebar
   can paint immediately on load without one owner's details leaking
   into another tab signed in as someone else.
   --------------------------------------------------------------- */

const CACHE_KEY = 'bnw_vendor_profile'
const EVENT = 'bnw-vendor-change'

export const DEFAULT_PROFILE = {
  truckName: '',
  tagline: '',
  cuisine: 'North Indian',
  spice: 'Medium',
  vegOnly: false,
  phone: '',
  parkedAt: '',
  opensAt: '16:00',
  closesAt: '23:00',
}

/** Truck row -> the shape the vendor pages already use. */
function fromTruck(truck) {
  return {
    truckName: truck.name ?? '',
    tagline: truck.tagline ?? '',
    cuisine: truck.cuisine ?? DEFAULT_PROFILE.cuisine,
    spice: truck.spiceLevel ?? DEFAULT_PROFILE.spice,
    vegOnly: truck.vegOnly ?? false,
    phone: truck.phone ?? '',
    parkedAt: truck.parkedAt ?? '',
    // The API returns "16:00:00"; <input type="time"> wants "16:00".
    opensAt: (truck.opensAt ?? DEFAULT_PROFILE.opensAt).slice(0, 5),
    closesAt: (truck.closesAt ?? DEFAULT_PROFILE.closesAt).slice(0, 5),
  }
}

/** The vendor pages' shape -> the request body the backend expects. */
function toBody(profile) {
  return {
    name: profile.truckName,
    tagline: profile.tagline,
    cuisine: profile.cuisine,
    spiceLevel: profile.spice,
    vegOnly: profile.vegOnly,
    phone: profile.phone,
    parkedAt: profile.parkedAt,
    opensAt: profile.opensAt,
    closesAt: profile.closesAt,
  }
}

function readCache() {
  try {
    const raw = getSession(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(value) {
  try {
    setSession(CACHE_KEY, JSON.stringify(value))
  } catch {
    /* storage blocked - state still works for this page view */
  }
  // Defer so this never fires synchronously during a React render/event handler,
  // which would cause "Cannot update a component while rendering a different component".
  setTimeout(() => window.dispatchEvent(new Event(EVENT)), 0)
}

export function useVendorStatus() {
  const [profile, setProfileState] = useState(() => ({ ...DEFAULT_PROFILE, ...readCache() }))
  const [isOpen, setIsOpenState] = useState(true)
  const [loading, setLoading] = useState(true)

  // Lets setProfile read the latest profile without taking it as a dependency.
  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])

  // Load the real row, then keep the cache in step with it.
  useEffect(() => {
    let cancelled = false
    apiGet('/api/v1/truck/me')
      .then((truck) => {
        if (cancelled || !truck) return
        const next = fromTruck(truck)
        setProfileState(next)
        setIsOpenState(truck.status !== 'INACTIVE')
        writeCache(next)
      })
      .catch(() => {
        /* keep whatever the cache had - the page stays usable offline */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Re-read the cache whenever another vendor page saves.
  useEffect(() => {
    const sync = () => setProfileState({ ...DEFAULT_PROFILE, ...readCache() })
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setProfile = useCallback(async (next) => {
    // Compute the merged profile SYNCHRONOUSLY. Doing it inside the state
    // updater looked equivalent but React runs that callback later, so the
    // value was still undefined by the time it reached toBody() - the save
    // failed with "Cannot read properties of undefined (reading 'truckName')".
    const current = profileRef.current
    const merged = typeof next === 'function' ? next(current) : { ...current, ...next }

    // Optimistic: repaint the sidebar before the round trip.
    setProfileState(merged)
    writeCache(merged)

    const saved = await apiPut('/api/v1/truck/me', toBody(merged))
    if (saved) {
      const fresh = fromTruck(saved)
      setProfileState(fresh)
      writeCache(fresh)
    }
    return saved
  }, [])

  const setIsOpen = useCallback(async (value) => {
    setIsOpenState(value)
    const saved = await apiPatch('/api/v1/truck/me/status', { open: value })
    if (saved) setIsOpenState(saved.status !== 'INACTIVE')
    return saved
  }, [])

  return { profile, setProfile, isOpen, setIsOpen, loading }
}
