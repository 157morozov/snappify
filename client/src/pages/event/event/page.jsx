import {Link, useParams} from "react-router-dom"
import {useEffect, useMemo, useState} from "react"

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
    const [gallery, setGallery] = useState([])
    const [tick, setTick] = useState(Date.now())

    useEffect(() => {
        const t = setInterval(() => setTick(Date.now()), 1000)
        api.events()
            .then(events => {
                const found = events.find(item => item.code === code) || null
                setEvent(found)
                if (found) return api.gallery(code).then(setGallery)
                return null
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
        return () => clearInterval(t)
    }, [code])

    if (loading) return <div className="user-event"><p>Загрузка мероприятия...</p></div>
    if (error) return <div className="user-event"><p>{error}</p></div>
    if (!event) return <div className="user-event"><p>Мероприятие не найдено.</p><Link to='/' className='link'>Назад</Link></div>


    const status = useMemo(() => {
        const start = event?.start_at ? new Date(event.start_at).getTime() : null
        const end = event?.end_at ? new Date(event.end_at).getTime() : null
        if (!start && !end) return 'Без даты'
        if (start && tick < start) return 'Запланировано'
        if (start && end && tick >= start && tick <= end) return 'В процессе'
        if (end && tick > end) return 'Завершено'
        return 'Без даты'
    }, [event, tick])

    const timerText = useMemo(() => {
        if (!event) return ''
        const start = event.start_at ? new Date(event.start_at).getTime() : null
        const end = event.end_at ? new Date(event.end_at).getTime() : null
        const fmt = (ms) => {
            const total = Math.max(0, Math.floor(ms / 1000))
            const h = Math.floor(total / 3600)
            const m = Math.floor((total % 3600) / 60)
            const s = total % 60
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        }
        if (start && tick < start) return `До начала: ${fmt(start - tick)}`
        if (start && end && tick <= end) return `До конца: ${fmt(end - tick)}`
        if (end && tick > end) return `После завершения: ${fmt(tick - end)}`
        return 'Таймер недоступен'
    }, [event, tick])


    const revealAllowed = useMemo(() => {
        if (!event) return false
        if (event.reveal_mode === 'instant') return true
        const end = event.end_at ? new Date(event.end_at).getTime() : null
        const revealAt = event.reveal_at ? new Date(event.reveal_at).getTime() : null
        if (end && tick >= end) return true
        if (revealAt && tick >= revealAt) return true
        return false
    }, [event, tick])

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
            <p className="user-event--date">{status} · {timerText}</p>
            <div className="user-event--configures">
                <div className="user-event--configure"><span className="user-event--configure--number">{event.shots_limit}</span><span className="user-event--configure--caption">Кадров</span></div>
                <div className="user-event--configure"><span className="user-event--configure--number">{event.reveal_mode === 'delayed' ? '⏱' : '⚡'}</span><span className="user-event--configure--caption">Режим</span></div>
                <div className="user-event--configure"><span className="user-event--configure--number">{event.film_filter ? 'ON' : 'OFF'}</span><span className="user-event--configure--caption">Фильтр</span></div>
            </div>
            <div className="user-event--invite">
                <div className="user-event--invite--qr">
                    <img alt="QR приглашения" width="72" height="72" src={`https://api.qrserver.com/v1/create-qr-code/?size=144x144&data=${encodeURIComponent(`https://${eventUrl}`)}`}/>
                </div>
                <div className="user-event--invite--description">
                    <span className="user-event--invite--heading">Пригласить гостей</span>
                    <span className="user-event--invite--url">{eventUrl}</span>
                </div>
                <button onClick={handleCodeCopy} type="button" className="user-event--invite--copy button button__outline">Копировать</button>
            </div>
            <Link to={`/event/${event.code}/camera`} className="button">+ Сделать фото</Link>
            <div className="user-event--gallery">
                <h3 className="user-event--gallery--heading">Фотографии</h3>
                {!revealAllowed && <p className="user-event--date">Галерея откроется после завершения мероприятия или по времени reveal.</p>}
                {revealAllowed && gallery.length === 0 && <p className="user-event--date">Пока нет загруженных фото.</p>}
                {revealAllowed && gallery.length > 0 && <div className="user-event--gallery--grid">
                    {gallery.map((photo, idx) => (
                        <div key={`${photo.file_path}_${idx}`} className="user-event--gallery--item">
                            <img src={`${import.meta.env.VITE_API_BASE?.replace('/api','') || 'http://localhost:8000'}${photo.url}`} alt="event" />
                        </div>
                    ))}
                </div>}
            </div>

        </div>
    )
}

export default Event
