import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {api} from '../../api'

import './style.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        await api.register({email, password, name})
        nav(`/auth/verify?email=${encodeURIComponent(email)}`)
        return
      }
      const data = await api.login({email, password})
      localStorage.setItem('token', data.token)
      nav('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return <div className='user-home auth-page'>
    <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
    <form onSubmit={submit} className='user-event-create--form'>
      {mode === 'register' && <input className='user-event-create--form--input' placeholder='Имя' value={name} onChange={e=>setName(e.target.value)} required />}
      <input className='user-event-create--form--input' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} required />
      <input type='password' className='user-event-create--form--input' placeholder='Пароль' value={password} onChange={e=>setPassword(e.target.value)} required />
      <button className='button'>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
    </form>
    <button className='button button__outline' onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
      {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
    </button>
    {error && <div className='auth-error-box'><b>Ошибка</b><span>{error}</span></div>}
  </div>
}
