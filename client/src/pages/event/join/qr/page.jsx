import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import Nav from '../../../../components/user/nav/component'
import {api} from '../../../../api'

export default function JoinQrPage() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const parseCode = (raw) => {
    const match = raw.match(/\/event\/([a-zA-Z0-9_-]{6,})/)
    if (match) return match[1].slice(0, 6)
    if (raw.length >= 6) return raw.slice(0, 6)
    return null
  }

  const openFromQr = async () => {
    setError('')
    const raw = value.trim()
    if (!raw) return setError('Введите ссылку/код из QR')

    const code = parseCode(raw)
    if (!code) return setError('Не удалось распознать QR')

    setLoading(true)
    try {
      const guestName = (localStorage.getItem('user_name') || 'Гость').trim()
      const data = await api.joinEvent(code, guestName)
      sessionStorage.setItem(`guest_key_${code}`, data.guest_key)
      navigate(`/event/${code}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <Nav/>
    <div className='user-home'>
      <h2>Вход по QR</h2>
      <p>Вставьте ссылку или код из QR — вход выполнится автоматически.</p>
      <input className='user-event-create--form--input' value={value} onChange={e=>setValue(e.target.value)} placeholder='https://.../event/ABC123 или ABC123' />
      <div className='space--small'/>
      <button className='button' onClick={openFromQr} disabled={loading}>{loading ? 'Подключаем...' : 'Войти в мероприятие'}</button>
      {error && <p className='auth-error'>{error}</p>}
    </div>
  </>
}
