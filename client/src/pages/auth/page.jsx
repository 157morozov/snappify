import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {api} from '../../api'

import './style.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        if (password !== passwordConfirm) throw new Error('Пароли не совпадают')
        const data = await api.register({login, password, name})
        const params = new URLSearchParams({ login })
        if (data?.passkey_code) params.set('passkey_code', data.passkey_code)
        nav(`/auth/verify?${params.toString()}`)
        return
      }
      const data = await api.login({login, password})
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_email', data.user?.login || login)
      nav('/')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return <div className='user-home auth-page'>
    <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
    <form onSubmit={submit} className='user-event-create--form'>
      {mode === 'register' && <input className='user-event-create--form--input' placeholder='Имя' value={name} onChange={e=>setName(e.target.value)} required />}
      <input className='user-event-create--form--input' placeholder='Логин' value={login} onChange={e=>setLogin(e.target.value)} required />
      <input type='password' className='user-event-create--form--input' placeholder='Пароль' value={password} onChange={e=>setPassword(e.target.value)} required />
      {mode === 'register' && <input type='password' className='user-event-create--form--input' placeholder='Подтвердите пароль' value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} required />}
      <button className='button' disabled={loading}>{loading ? 'Отправляем...' : (mode === 'login' ? 'Войти' : 'Создать аккаунт')}</button>
    </form>
    <button className='button button__outline' onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}</button>
    {error && <div className='auth-error-box'><b>Ошибка</b><span>{error}</span></div>}
  </div>
}
