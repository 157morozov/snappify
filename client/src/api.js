const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function token() { return localStorage.getItem('token') || '' }

function forceLogoutWithMessage(messageKey = 'session-expired') {
  localStorage.removeItem('token')
  localStorage.removeItem('user_email')
  localStorage.removeItem('user_name')
  const url = `/auth?reason=${encodeURIComponent(messageKey)}`
  if (window.location.pathname !== '/auth') window.location.href = url
}

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

  if (res.status === 401 && (data.detail === 'Сессия истекла' || data.detail === 'Отсутствует токен авторизации')) {
    forceLogoutWithMessage('session-expired')
    throw new Error('Сессия истекла. Войдите снова.')
  }

  if (!res.ok) {
    const detail = data?.detail
    if (Array.isArray(detail) && detail.length) {
      const first = detail[0]
      throw new Error(first?.msg || 'Некорректные данные формы')
    }
    if (typeof detail === 'string') {
      if (detail === 'Неверный логин или пароль') throw new Error('Неверный логин или пароль')
      throw new Error(detail)
    }
    throw new Error('Ошибка запроса')
  }
  return data
}

export const api = {
  register: payload => request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  passkeyConfirm: payload => request('/auth/passkey/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  login: payload => request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  events: () => request('/events'),
  createEvent: payload => request('/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  joinEvent: (code, guestName) => { const f = new FormData(); f.append('guest_name', guestName); return request(`/events/${code}/join`, { method: 'POST', body: f }); },
  gallery: code => request(`/events/${code}/gallery`),
  uploadPhoto: ({code, guestKey, file, filterName = 'none'}) => {
    const form = new FormData()
    form.append('guest_key', guestKey)
    form.append('filter_name', filterName)
    form.append('photo', file)
    return request(`/events/${code}/photos`, { method: 'POST', body: form })
  },
}
