import {Link, useParams} from "react-router-dom"
import {useEffect, useState} from "react"

import {DOMAIN_NAME} from "../../../data/constants"
import {api} from "../../../api"
import IconBack from "../../../components/icons/Back"
import QRCode from "../../../components/icons/QRCode"

import "./style.css"

function Event() {
    const { code } = useParams()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.events()
            .then(events => setEvent(events.find(item => item.code === code) || null))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [code])

    if (loading) return <div className="user-event"><p>Загрузка мероприятия...</p></div>
    if (error) return <div className="user-event"><p>{error}</p></div>
    if (!event) return <div className="user-event"><p>Мероприятие не найдено.</p><Link to='/' className='link'>Назад</Link></div>

    const eventUrl = `${DOMAIN_NAME}/event/${event.code}`

    async function handleCodeCopy() {
        try {
            await navigator.clipboard.writeText(`https://${eventUrl}`)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    return (
        <div className="user-event">
            <Link to="/" className="link"><IconBack/>Все мероприятия</Link>
            <h2 className="user-event--heading">{event.name}</h2>
            <p className="user-event--date">{new Date(event.created_at || Date.now()).toLocaleDateString('ru-RU')}</p>
            <div className="user-event--configures">
                <div className="user-event--configure"><span className="user-event--configure--number">{event.shots_limit}</span><span className="user-event--configure--caption">Кадров</span></div>
                <div className="user-event--configure"><span className="user-event--configure--number">{event.reveal_mode === 'delayed' ? '⏱' : '⚡'}</span><span className="user-event--configure--caption">Режим</span></div>
                <div className="user-event--configure"><span className="user-event--configure--number">{event.film_filter ? 'ON' : 'OFF'}</span><span className="user-event--configure--caption">Фильтр</span></div>
            </div>
            <div className="user-event--invite">
                <div className="user-event--invite--qr"><QRCode/></div>
                <div className="user-event--invite--description">
                    <span className="user-event--invite--heading">Пригласить гостей</span>
                    <span className="user-event--invite--url">{eventUrl}</span>
                </div>
                <button onClick={handleCodeCopy} type="button" className="user-event--invite--copy button button__outline">Копировать</button>
            </div>
        </div>
    )
}

export default Event
