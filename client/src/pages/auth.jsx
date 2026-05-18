import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [needVerify, setNeedVerify] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (mode === 'register') {
        await api.register({email, password, name});
        setNeedVerify(true);
        return;
      }
      const data = await api.login({email, password});
      localStorage.setItem('token', data.token);
      nav('/');
    } catch (err) { setError(err.message); }
  };

  const verify = async () => {
    try { await api.verify(email, code); setNeedVerify(false); setMode('login'); }
    catch (err) { setError(err.message); }
  }

  return <div className='user-home'>
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
    {needVerify && <div>
      <input className='user-event-create--form--input' placeholder='Код из почты' value={code} onChange={e=>setCode(e.target.value)} />
      <button className='button' onClick={verify}>Подтвердить email</button>
    </div>}
    {error && <p>{error}</p>}
  </div>
}
