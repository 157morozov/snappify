import {useEffect, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {api} from '../../api'
import {useSystemModal} from '../../components/system/modal/context'

import './style.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [search] = useSearchParams()
  const nav = useNavigate()
  const {showMessage} = useSystemModal()

  useEffect(() => {
    if (search.get('reason') === 'session-expired') {
      setError('Сессия истекла. Войдите в аккаунт снова.')
      showMessage({title: 'Сессия завершена', text: 'Пожалуйста, войдите снова.', type: 'error'})
    }
  }, [search, showMessage])

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        if (password !== passwordConfirm) throw new Error('Пароли не совпадают')
        const data = await api.register({login, password, name})
        sessionStorage.setItem('pending_login', login)
        sessionStorage.setItem('pending_password', password)
        const params = new URLSearchParams({ login })
        if (data?.passkey_code) params.set('passkey_code', data.passkey_code)
        showMessage({title: 'Регистрация начата', text: 'Подтвердите passkey код.', type: 'success'})
        nav(`/auth/verify?${params.toString()}`)
        return
      }
      const data = await api.login({login, password})
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_email', data.user?.login || login)
      localStorage.setItem('user_name', data.user?.name || '')
      showMessage({title: 'Успешный вход', text: 'Добро пожаловать!', type: 'success'})
      nav('/')
    } catch (err) { setError(err.message); showMessage({title:'Ошибка', text: err.message, type:'error'}) } finally { setLoading(false) }
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
