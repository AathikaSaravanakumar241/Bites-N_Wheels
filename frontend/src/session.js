
const SESSION_KEYS = [
  'bnw_token',
  'bnw_role',
  'bnw_userId',
  'bnw_name',
  'bnw_email',
  'bnw_phone',
  'bnw_vendor_profile',
]
export function getSession(key) {
  try {
    return sessionStorage.getItem(key) || ''
  } catch {    return ''
  }
}
export function setSession(key, value) {
  try {
    sessionStorage.setItem(key, value ?? '')
  } catch {
  }
}
export function removeSession(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {
  }
}
export function clearSession() {
  SESSION_KEYS.forEach(removeSession)
}
;(function dropLegacyLocalStorageSession() {
  try {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
  }
})()
