import {useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {api} from '../../../api'

import '../style.css'

export default function VerifyPage() {
  const [search] = useSearchParams()
  const [login] = useState(search.get('login') || '')
  const [code, setCode] = useState(search.get('passkey_code') || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const nav = useNavigate()

  const verify = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await api.passkeyConfirm({login, passkey_code: code})
      const pendingLogin = sessionStorage.getItem('pending_login') || login
      const pendingPassword = sessionStorage.getItem('pending_password') || ''
      if (pendingLogin && pendingPassword) {
        const auth = await api.login({login: pendingLogin, password: pendingPassword})
        localStorage.setItem('token', auth.token)
        localStorage.setItem('user_email', auth.user?.login || pendingLogin)
        localStorage.setItem('user_name', auth.user?.name || '')
        sessionStorage.removeItem('pending_login')
        sessionStorage.removeItem('pending_password')
        nav('/')
        return
      }
      setSuccess('Passkey подтвержден. Теперь войдите в аккаунт.')
      setTimeout(() => nav('/auth'), 900)
    } catch (err) { setError(err.message) }
  }

  return <div className='user-home auth-page'>
    <h2>Подтверждение Passkey</h2>
    <p className='auth-muted'>Логин: <b>{login}</b></p>
    <p className='auth-muted'>Введите код подтверждения для этого аккаунта.</p>
    <form className='user-event-create--form' onSubmit={verify}>
      <input className='user-event-create--form--input' placeholder='Passkey код' value={code} onChange={e=>setCode(e.target.value)} minLength={6} maxLength={6} required />
      <button className='button'>Подтвердить</button>
    </form>
    {error && <div className='auth-error-box'><b>Ошибка</b><span>{error}</span></div>}
    {success && <div className='auth-success-box'>{success}</div>}
    <Link to='/auth' className='link'>Вернуться ко входу</Link>
  </div>
}
