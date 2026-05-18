import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../../api"

import "./style.css"
import {useSystemModal} from "../../../components/system/modal/context"

function EventCreateForm() {
    const [photoCount, setPhotoCount] = useState(20)
    const [name, setName] = useState('')
    const [delayed, setDelayed] = useState(false)
    const [film, setFilm] = useState(false)
    const [error, setError] = useState('')
    const [startAt, setStartAt] = useState('')
    const [endAt, setEndAt] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const {showMessage} = useSystemModal()

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const revealAt = delayed ? new Date(Date.now() + 24 * 3600 * 1000).toISOString() : null
            const data = await api.createEvent({ name, shots_limit: Number(photoCount), reveal_mode: delayed ? 'delayed' : 'instant', reveal_at: revealAt, start_at: startAt ? new Date(startAt).toISOString() : null, end_at: endAt ? new Date(endAt).toISOString() : null, is_public: true, film_filter: film })
            showMessage({title: "Успех", text: "Мероприятие создано", type: "success"})
            navigate(`/event/${data.code}`)
        } catch (err) {
            setError(err.message)
            showMessage({title: "Ошибка", text: err.message, type: "error"})
        } finally { setLoading(false) }
    }

    return (
        <form className="user-event-create--form" onSubmit={handleSubmit}>
            <div className="user-event-create--form--container">
                <label className="user-event-create--form--label" htmlFor="inpEventCreateName">Название</label>
                <input className="user-event-create--form--input" id="inpEventCreateName" name="eventName" placeholder="Свадьба, день рождения..." required value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="user-event-create--form--container">
                <label className="user-event-create--form--label" htmlFor="inpEventStartAt">Дата начала</label>
                <input className="user-event-create--form--input" id="inpEventStartAt" type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} />
            </div>
            <div className="user-event-create--form--container">
                <label className="user-event-create--form--label" htmlFor="inpEventEndAt">Дата окончания</label>
                <input className="user-event-create--form--input" id="inpEventEndAt" type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} />
            </div>
            <div className="user-event-create--form--container">
                <label className="user-event-create--form--label">Кадров на гостя</label>
                <div className="user-event-create--form--range-wrapper">
                    <input className="user-event-create--form--range" name="eventPhotoCount" onChange={e => setPhotoCount(e.target.value)} type="range" min={1} max={50} defaultValue={20} />
                    <span className="user-event-create--form--range-counter">{photoCount}</span>
                </div>
            </div>
            <div className="user-event-create--form--boxes">
                <div className="user-event-create--form--box">
                    <div className="user-event-create--form--box-desc">
                        <p className="user-event-create--form--box-title">Отложенное открытие</p>
                        <p className="user-event-create--form--box-caption">Фото появятся на следующий день</p>
                    </div>
                    <input id="inpEventDelayedPhoto" className="user-event-create--form--box-checkbox" type="checkbox" name="eventDelayedPhoto" checked={delayed} onChange={e => setDelayed(e.target.checked)} hidden />
                    <label htmlFor="inpEventDelayedPhoto" className="user-event-create--form--toggle"><div className="user-event-create--form--toggle-dot"></div></label>
                </div>
                <div className="user-event-create--form--box">
                    <div className="user-event-create--form--box-desc">
                        <p className="user-event-create--form--box-title">Фильтр «плёнка»</p>
                        <p className="user-event-create--form--box-caption">Эффект одноразового фотоаппарата</p>
                    </div>
                    <input id="inpEventOldFilter" className="user-event-create--form--box-checkbox" type="checkbox" name="eventOldFilter" checked={film} onChange={e => setFilm(e.target.checked)} hidden />
                    <label htmlFor="inpEventOldFilter" className="user-event-create--form--toggle"><div className="user-event-create--form--toggle-dot"></div></label>
                </div>
            </div>
            <button type="submit" className="button" disabled={loading}>{loading ? 'Создаем...' : 'Создать мероприятие'}</button>
            {error && <p className='auth-error'>{error}</p>}
        </form>
    )
}

export default EventCreateForm
