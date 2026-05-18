import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'

import './style.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const login = localStorage.getItem('user_email') || '—'
  const name = localStorage.getItem('user_name') || 'Пользователь'
  const letter = useMemo(() => (login[0] || 'U').toUpperCase(), [login])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    navigate('/auth?reason=session-expired')
  }

  return <div className='user-home profile-page'>
    <h2>Профиль</h2>
    <div className='profile-card'>
      <div className='profile-avatar'>{letter}</div>
      <div className='profile-info'>
        <p className='profile-name'>{name}</p>
        <p className='profile-login'>{login}</p>
      </div>
    </div>
    <button className='button button__outline' onClick={handleLogout}>Выйти из аккаунта</button>
  </div>
}
