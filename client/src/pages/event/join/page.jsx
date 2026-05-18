import {useState} from "react"
import {Link, useNavigate} from "react-router-dom"

import Nav from "../../../components/user/nav/component"
import QRCode from "../../../components/icons/QRCode"
import {api} from "../../../api"

import "./style.css"
import {useSystemModal} from "../../../components/system/modal/context"

function Join() {
    const [code, setCode] = useState('')
    const [guestName, setGuestName] = useState('Гость')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const {showMessage} = useSystemModal()

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await api.joinEvent(code.trim(), guestName.trim())
            sessionStorage.setItem(`guest_key_${code.trim()}`, data.guest_key)
            navigate(`/event/${code.trim()}`)
        } catch (err) {
            setError(err.message)
            showMessage({title: "Ошибка входа", text: err.message, type: "error"})
        } finally { setLoading(false) }
    }

    return (
        <>
            <Nav/>
            <div className="user-event-join">
                <h2 className="user-event-join--heading">Поиск <span>мероприятия</span></h2>
                <p className="user-event-join--description">Введите код или отсканируйте QR</p>
                <div className="space--small"></div>
                <form className="user-event-join--form" onSubmit={handleSubmit}>
                    <div className="user-event-join--form--container">
                        <label className="user-event-join--form--label" htmlFor="inpEventJoinCode">Код мероприятия</label>
                        <input className="user-event-join--form--input" id="inpEventJoinCode" name="eventCode" value={code} onChange={e=>setCode(e.target.value)} placeholder="GxFs0z" minLength={6} maxLength={6} required/>
                    </div>
                    <div className="user-event-join--form--container">
                        <label className="user-event-join--form--label" htmlFor="inpEventJoinGuest">Ваше имя</label>
                        <input className="user-event-join--form--input" id="inpEventJoinGuest" name="guestName" value={guestName} onChange={e=>setGuestName(e.target.value)} minLength={2} required/>
                    </div>
                    <button type="submit" className="button" disabled={loading}>{loading ? 'Подключаем...' : 'Войти'}</button>
                </form>
                {error && <p className='auth-error'>{error}</p>}
                <div className="space--small"></div>
                <div className="user-event-join--separator"><hr/><span>Или</span></div>
                <div className="space--small"></div>
                <div className="user-event-join--qr">
                    <div className="user-event-join--qr-code"><QRCode/></div>
                    <h3 className="user-event-join--qr--heading">Сканировать QR-код</h3>
                    <p className="user-event-join--qr--caption">Наведите камеру на QR организатора</p>
                    <div className="space--small"></div>
                    <Link to="/event/join/qr" className="user-event-join--qr--link button button__outline">Открыть камеру</Link>
                </div>
            </div>
        </>
    )
}

export default Join
