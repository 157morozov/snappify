import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../../api"

import Nav from "../../components/user/nav/component"

import "./style.css"

function eventStatus(event) {
    const now = Date.now()
    const start = event.start_at ? new Date(event.start_at).getTime() : null
    const end = event.end_at ? new Date(event.end_at).getTime() : null
    if (start && now < start) return "Запланировано"
    if (start && end && now >= start && now <= end) return "В процессе"
    if (end && now > end) return "Завершено"
    return "Без даты"
}

function Home() {
    const [events, setEvents] = useState([])
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth')
            return
        }
        api.events().then(setEvents).catch(err => setError(err.message))
    }, [navigate])

    return (
        <>
            <Nav />
            <div className="user-home">
                <Link to="/event/create" className="button">+ Новое мероприятие</Link>
                {error && <p>{error}</p>}
                <div className="user-home--events">
                    {events.map(event => (
                        <Link to={`/event/${event.code}`} key={event.id} className="user-home--event user-home--event__active">
                            <h3 className="user-home--event--heading">{event.name}</h3>
                            <div className="user-home--event--configures">
                                <span className="user-home--event--configure">📷 {event.shots_limit}</span>
                                <span className="user-home--event--configure">🔓 {event.reveal_mode}</span>
                                <span className="user-home--event--configure">🗓 {eventStatus(event)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Home
