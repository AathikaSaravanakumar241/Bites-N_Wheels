/* ---------------------------------------------------------------
   Per-tab session store.

   This app is routinely used with a customer signed in on one tab and a
   truck owner on another. localStorage is shared by every tab on an
   origin, so a single `bnw_token` key meant the second login silently
   overwrote the first. The other tab then sent the wrong role's token,
   its calls came back 403, and the page looked like "no data found" or a
   dead backend - even though the server was fine.

   sessionStorage is scoped to a single tab, so each tab keeps its own
   login and the two roles stop fighting over one key.

   Trade-off, and it is the right one here: closing a tab ends that tab's
   session, and a brand-new tab starts signed out. Duplicating a tab
   copies the session, which is a convenient way to open a second view as
   the same user.

   Preferences that are NOT identity (the last delivery address, the
   chosen area) deliberately stay in localStorage - they are useful
   across tabs and leak nothing.
   --------------------------------------------------------------- */

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
  } catch {
    // Private mode or blocked storage: the app still works for this view.
    return ''
  }
}

export function setSession(key, value) {
  try {
    sessionStorage.setItem(key, value ?? '')
  } catch {
    /* storage blocked */
  }
}

export function removeSession(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* storage blocked */
  }
}

/** Sign out of THIS tab only. Other tabs keep their own sessions. */
export function clearSession() {
  SESSION_KEYS.forEach(removeSession)
}

/**
 * Drop the identity keys left in localStorage by the pre-session-storage
 * build. Without this an old shared token lingers and keeps overwriting
 * behaviour that has otherwise been fixed. Runs once at module load.
 */
;(function dropLegacyLocalStorageSession() {
  try {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    /* storage blocked */
  }
})()
