import {useState} from 'react'

export default function ProfilePage() {
  const [email] = useState(localStorage.getItem('user_email') || '—')
  return <div className='user-home'>
    <h2>Профиль</h2>
    <p>Email: {email}</p>
  </div>
}
