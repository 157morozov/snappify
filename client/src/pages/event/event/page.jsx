import {Link, useParams} from "react-router-dom"
import {useEffect, useState} from "react"

import {DOMAIN_NAME} from "../../../data/constants"
import {api} from "../../../api"
import IconBack from "../../../components/icons/Back"

import "./style.css"

function Event() {
    const { code } = useParams()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [gallery, setGallery] = useState([])
    const [tick, setTick] = useState(0)
    const [qrOpen, setQrOpen] = useState(false)

    useEffect(() => {
        const t = setInterval(() => setTick(Date.now()), 1000)
        const load = async () => {
            try {
                let found = null
                try {
                    const events = await api.events()
                    found = events.find(item => item.code === code) || null
                } catch {
                    // ignore private endpoint errors for guest-mode
                }

                if (!found) found = await api.publicEvent(code)
                setEvent(found)

                if (localStorage.getItem('token')) {
                    try {
                        const g = await api.gallery(code)
                        setGallery(g)
                    } catch {
                        setGallery([])
                    }
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => clearInterval(t)
    }, [code])

    if (loading) return <div className="user-event"><div className='skeleton-card'/></div>
    if (error) return <div className="user-event"><p className='auth-error'>{error}</p></div>
    if (!event) return <div className="user-event"><p>Мероприятие не найдено.</p><Link to='/' className='link'>Назад</Link></div>

    const start = event.start_at ? new Date(event.start_at).getTime() : null
    const end = event.end_at ? new Date(event.end_at).getTime() : null
    const revealAt = event.reveal_at ? new Date(event.reveal_at).getTime() : null
    const status = !start && !end ? 'Без даты' : (start && tick < start ? 'Запланировано' : (start && end && tick <= end ? 'В процессе' : (end && tick > end ? 'Завершено' : 'Без даты')))
    const fmt = (ms) => { const total = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` }
    const timerText = start && tick < start ? `До начала: ${fmt(start - tick)}` : (start && end && tick <= end ? `До конца: ${fmt(end - tick)}` : (end && tick > end ? `После завершения: ${fmt(tick - end)}` : 'Таймер недоступен'))
    const revealAllowed = event.reveal_mode === 'instant' || (end && tick >= end) || (revealAt && tick >= revealAt)
    const canTakePhoto = status === 'В процессе'

    const eventUrl = `${DOMAIN_NAME}/event/${event.code}`
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(`https://${eventUrl}`)}`
    const apiRoot = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:8000'

    return <div className="user-event">
        {status === 'Завершено' && <div className='confetti'>🎉 ✨ 🎊</div>}
        <Link to="/" className="link"><IconBack/>Все мероприятия</Link>
        <h2 className="user-event--heading">{event.name}</h2>
        <p className="user-event--date">{new Date(event.created_at || tick).toLocaleDateString('ru-RU')}</p>
        <p className="user-event--date">{status} · {timerText}</p>
        {status === 'Завершено' && <p className='user-event--date'>Спасибо, что были с нами! 🎉</p>}
        <div className="user-event--invite">
            <button className="user-event--invite--qr" onClick={() => setQrOpen(true)}><img alt="QR приглашения" width="72" height="72" src={qrSrc}/></button>
            <div className="user-event--invite--description">
                <span className="user-event--invite--heading">Пригласить гостей</span>
                <span className="user-event--invite--url">{eventUrl}</span>
            </div>
        </div>

        <Link to={`/event/${event.code}/camera`} className="button" style={{opacity: canTakePhoto ? 1 : .5, pointerEvents: canTakePhoto ? 'auto' : 'none'}}>
            {status === 'Запланировано' ? 'Фото доступны после старта' : (status === 'Завершено' ? 'Мероприятие завершено' : '+ Сделать фото')}
        </Link>

        <div className="user-event--gallery">
            <h3 className="user-event--gallery--heading">Фотографии</h3>
            {!revealAllowed && <p className="user-event--date">Галерея откроется после завершения мероприятия или по времени reveal.</p>}
            {revealAllowed && gallery.length === 0 && <p className="user-event--date">Пока нет загруженных фото.</p>}
            {revealAllowed && gallery.length > 0 && <div className="user-event--gallery--grid">{gallery.map((photo, idx) => <div key={`${photo.file_path}_${idx}`} className="user-event--gallery--item"><img src={`${apiRoot}${photo.url}`} alt="event" /></div>)}</div>}
        </div>

        {qrOpen && <div className='system-modal-backdrop' onClick={() => setQrOpen(false)}><div className='system-modal' onClick={e => e.stopPropagation()}><h4>QR приглашения</h4><img src={qrSrc} alt='qr-full' style={{width:'100%',borderRadius:8}}/><button className='button' onClick={() => setQrOpen(false)}>Закрыть</button></div></div>}
    </div>
}

export default Event
