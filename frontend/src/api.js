import { getSession, setSession, clearSession } from './session.js'

const TOKEN_KEY = 'bnw_token'

// Per tab, not per browser - see session.js. Two roles signed in at once
// (customer in one tab, truck owner in another) is a normal way to use this
// app, and a shared token key made them overwrite each other.
export function getToken() {
  return getSession(TOKEN_KEY)
}

export function saveToken(token) {
  setSession(TOKEN_KEY, token)
}

/** Signs this tab out. Other tabs keep their own session. */
export function clearToken() {
  clearSession()
}

function buildOptions(method, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const options = { method, headers }
  if (body !== undefined) options.body = JSON.stringify(body)
  return options
}

async function request(url, method, body, auth = true) {
  const res = await fetch(url, buildOptions(method, body, auth))

  // An expired or missing token used to just throw, leaving every vendor page
  // stuck on "Unable to load..." with no way to tell that signing in again is
  // all that is needed. Clear the dead token and send the user to /login.
  if ((res.status === 401 || res.status === 403) && auth) {
    clearToken()
    const onAuthPage = ['/login', '/register', '/'].includes(window.location.pathname)
    if (!onAuthPage) {
      window.location.assign('/login?expired=1')
    }
  }

  if (!res.ok) {
    let msg = `${method} ${url} failed with ${res.status}`
    try {
      const err = await res.json()
      msg = err.message || err.error || msg
    } catch {
      /* ignore */
    }
    const error = new Error(msg)
    error.status = res.status
    throw error
  }

  if (res.status === 204) return null
  return res.json()
}

/**
 * Turn a thrown request error into something worth showing a user.
 *
 * Every page used to print its own guess - "Check that the backend is running
 * on port 8080" - for any failure at all. That was actively misleading: a 400
 * from a lazy-loading bug, or a 403 from an expired token, both claimed the
 * server was down. The server already sends {"message": "..."}; this surfaces
 * it, and only blames connectivity when fetch itself never got a response.
 */
export function describeError(err, fallback = 'Something went wrong.') {
  if (!err) return fallback

  // request() only sets .status once a response came back, so its absence
  // means fetch() itself rejected - the server really was unreachable.
  //
  // 502/503/504 mean the same thing here: in dev the Vite proxy answers for a
  // backend that is not listening, so "backend down" arrives as a gateway
  // error rather than a failed fetch. Verified by stopping the backend.
  if (err.status === undefined || err.status === 502 || err.status === 503 || err.status === 504) {
    return 'Cannot reach the server. Check that the backend is running on port 8080.'
  }

  if (err.status === 401 || err.status === 403) {
    return 'Your session has expired. Please sign in again.'
  }

  return err.message || `${fallback} (HTTP ${err.status})`
}

export const get   = (url, auth = true)       => request(url, 'GET',    undefined, auth)
export const post  = (url, body, auth = true) => request(url, 'POST',   body,      auth)
export const put   = (url, body, auth = true) => request(url, 'PUT',    body,      auth)
export const patch = (url, body, auth = true) => request(url, 'PATCH',  body,      auth)
export const del   = (url, auth = true)       => request(url, 'DELETE', undefined, auth)
