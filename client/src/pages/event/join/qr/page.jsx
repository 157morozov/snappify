import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import Nav from '../../../../components/user/nav/component'

export default function JoinQrPage() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const openFromQr = () => {
    setError('')
    const raw = value.trim()
    if (!raw) return setError('Введите ссылку/код из QR')
    const match = raw.match(/\/event\/([a-zA-Z0-9_-]{6,})/)
    if (match) { navigate(`/event/${match[1]}`); return }
    if (raw.length >= 6) { navigate(`/event/${raw.slice(0,6)}`); return }
    setError('Не удалось распознать QR')
  }

  return <>
    <Nav/>
    <div className='user-home'>
      <h2>Вход по QR</h2>
      <p>На компьютере без нативного сканера: вставьте ссылку/код из QR.</p>
      <input className='user-event-create--form--input' value={value} onChange={e=>setValue(e.target.value)} placeholder='https://.../event/ABC123 или ABC123' />
      <div className='space--small'/>
      <button className='button' onClick={openFromQr}>Открыть мероприятие</button>
      {error && <p className='auth-error'>{error}</p>}
    </div>
  </>
}
