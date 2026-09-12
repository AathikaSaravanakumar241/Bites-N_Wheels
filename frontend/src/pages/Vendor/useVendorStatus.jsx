import { useCallback, useEffect, useRef, useState } from 'react'
import { get as apiGet, put as apiPut, patch as apiPatch } from '../../api.js'
import { getSession, setSession } from '../../session.js'


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

function fromTruck(truck) {
  return {
    truckName: truck.name ?? '',
    tagline: truck.tagline ?? '',
    cuisine: truck.cuisine ?? DEFAULT_PROFILE.cuisine,
    spice: truck.spiceLevel ?? DEFAULT_PROFILE.spice,
    vegOnly: truck.vegOnly ?? false,
    phone: truck.phone ?? '',
    parkedAt: truck.parkedAt ?? '',    opensAt: (truck.opensAt ?? DEFAULT_PROFILE.opensAt).slice(0, 5),
    closesAt: (truck.closesAt ?? DEFAULT_PROFILE.closesAt).slice(0, 5),
  }
}

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
  }  setTimeout(() => window.dispatchEvent(new Event(EVENT)), 0)
}

export function useVendorStatus() {
  const [profile, setProfileState] = useState(() => ({ ...DEFAULT_PROFILE, ...readCache() }))
  const [isOpen, setIsOpenState] = useState(true)
  const [loading, setLoading] = useState(true)  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])  useEffect(() => {
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
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])  useEffect(() => {
    const sync = () => setProfileState({ ...DEFAULT_PROFILE, ...readCache() })
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setProfile = useCallback(async (next) => {    const current = profileRef.current
    const merged = typeof next === 'function' ? next(current) : { ...current, ...next }    setProfileState(merged)
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
