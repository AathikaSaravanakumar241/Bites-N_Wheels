const TOKEN_KEY = 'bnw_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
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

export const get   = (url, auth = true)       => request(url, 'GET',    undefined, auth)
export const post  = (url, body, auth = true) => request(url, 'POST',   body,      auth)
export const put   = (url, body, auth = true) => request(url, 'PUT',    body,      auth)
export const patch = (url, body, auth = true) => request(url, 'PATCH',  body,      auth)
export const del   = (url, auth = true)       => request(url, 'DELETE', undefined, auth)
