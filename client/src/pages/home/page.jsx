import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../../api"

import Nav from "../../components/user/nav/component"

import "./style.css"

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
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Home
