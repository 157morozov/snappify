import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../../api"

import "./style.css"

function EventCreateForm() {
    const [photoCount, setPhotoCount] = useState(20)
    const [name, setName] = useState('')
    const [delayed, setDelayed] = useState(false)
    const [film, setFilm] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        try {
            const revealAt = delayed ? new Date(Date.now() + 24 * 3600 * 1000).toISOString() : null
            const data = await api.createEvent({ name, shots_limit: Number(photoCount), reveal_mode: delayed ? 'delayed' : 'instant', reveal_at: revealAt, is_public: true, film_filter: film })
            navigate(`/event/${data.code}`)
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <form className="user-event-create--form" onSubmit={handleSubmit}>
            <div className="user-event-create--form--container">
                <label className="user-event-create--form--label" htmlFor="inpEventCreateName">Название</label>
                <input className="user-event-create--form--input" id="inpEventCreateName" name="eventName" placeholder="Свадьба, день рождения..." required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="user-event-create--form--container">
                <label className="user-event-create--form--label">Кадров на гостя</label>
                <div className="user-event-create--form--range-wrapper">
                    <input className="user-event-create--form--range" name="eventPhotoCount" onChange={e => setPhotoCount(e.target.value)} type="range" min={1} max={50} defaultValue={20} />
                    <span className="user-event-create--form--range-counter">{photoCount}</span>
                </div>
            </div>
            <div className="user-event-create--form--boxes">
                <div className="user-event-create--form--box"><p className="user-event-create--form--box-title">Отложенное открытие</p><input type='checkbox' checked={delayed} onChange={e=>setDelayed(e.target.checked)} /></div>
                <div className="user-event-create--form--box"><p className="user-event-create--form--box-title">Фильтр «плёнка»</p><input type='checkbox' checked={film} onChange={e=>setFilm(e.target.checked)} /></div>
            </div>
            <button type="submit" className="button">Создать мероприятие</button>
            {error && <p>{error}</p>}
        </form>
    )
}

export default EventCreateForm
