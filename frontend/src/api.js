import { getSession, setSession, clearSession } from './session.js'
const TOKEN_KEY = 'bnw_token'export function getToken() {
  return getSession(TOKEN_KEY)
}
export function saveToken(token) {
  setSession(TOKEN_KEY, token)
}
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
  const res = await fetch(url, buildOptions(method, body, auth))  if ((res.status === 401 || res.status === 403) && auth) {
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
    }
    const error = new Error(msg)
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}
export function describeError(err, fallback = 'Something went wrong.') {
  if (!err) return fallback  if (err.status === undefined || err.status === 502 || err.status === 503 || err.status === 504) {
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
