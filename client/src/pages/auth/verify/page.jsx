import {useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {api} from '../../../api'

import '../style.css'

export default function VerifyPage() {
  const [search] = useSearchParams()
  const [email, setEmail] = useState(search.get('email') || '')
  const fallbackCode = search.get('dev_code') || ''
  const initialMessage = search.get('message') || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const nav = useNavigate()

  const verify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.verify(email, code)
      setSuccess('Email успешно подтвержден. Теперь можно войти в аккаунт.')
      setTimeout(() => nav('/auth'), 900)
    } catch (err) {
      setError(err.message === 'Invalid code' ? 'Неверный код. Проверьте письмо и попробуйте снова.' : err.message)
    }
  }

  return <div className='user-home auth-page'>
    <h2>Подтверждение почты</h2>
    <p className='auth-muted'>Введите 6-значный код из письма.</p>
    {!!initialMessage && <div className='auth-error-box'><b>SMTP недоступен</b><span>{initialMessage}</span>{!!fallbackCode && <span>dev_code: <b>{fallbackCode}</b></span>}</div>}
    <form className='user-event-create--form' onSubmit={verify}>
      <input className='user-event-create--form--input' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className='user-event-create--form--input' placeholder='Код подтверждения' value={code} onChange={e=>setCode(e.target.value)} minLength={6} maxLength={6} required />
      <button className='button'>Подтвердить</button>
    </form>
    {error && <div className='auth-error-box'><b>Неверный код</b><span>{error}</span></div>}
    {success && <div className='auth-success-box'>{success}</div>}
    <Link to='/auth' className='link'>Вернуться ко входу</Link>
  </div>
}
