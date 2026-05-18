const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function token() { return localStorage.getItem('token') || '' }

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: token() ? `Bearer ${token()}` : '' },
    })
  } catch {
    throw new Error('Не удалось подключиться к серверу. Проверьте, что backend запущен и VITE_API_BASE указан верно.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  register: payload => request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  passkeyConfirm: payload => request('/auth/passkey/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  login: payload => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  events: () => request('/events'),
  createEvent: payload => request('/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
}
