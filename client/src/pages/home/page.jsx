import { useState } from "react"
import { Link } from "react-router-dom"

import { initialEvents } from "../../data/mock"

import Nav from "../../components/user/nav/component"

import "./style.css"

function Home() {
    const [events, setEvents] = useState(initialEvents)

    const activeEvents = events.filter(e => e.status === 'active')
    const closedEvents = events.filter(e => e.status === 'closed')
    const pendingEvents  = events.filter(e => e.status === 'pending')

    return (
        <>
            <Nav />
            <div className="user-home">
                <Link to="/event/create" className="button">+ Новое мероприятие</Link>
                <div className="user-home--events">
                    {activeEvents.length > 0 &&
                        <>
                            <p className="user-home--events--heading">Активные</p>
                            {activeEvents.map(event => (
                                <Link to={`/event/${event.code}`} key={event.id} className="user-home--event user-home--event__active">
                                    <h3 className="user-home--event--heading">{event.name}</h3>
                                    <div className="user-home--event--configures">
                                        <span className="user-home--event--configure">📅 {event.date}</span>
                                        <span className="user-home--event--configure">👥 {event.participants} чел.</span>
                                        <span className="user-home--event--configure">📷 {event.shots}</span>
                                    </div>
                                </Link>
                            ))}
                        </>
                    }
                    {pendingEvents.length > 0 &&
                        <>
                            <p className="user-home--events--heading">В ожидании</p>
                            {pendingEvents.map(event => (
                                <Link to={`/event/${event.code}`} key={event.id} className="user-home--event user-home--event__pending">
                                    <h3 className="user-home--event--heading">{event.name}</h3>
                                    <div className="user-home--event--configures">
                                        <span className="user-home--event--configure">📅 {event.date}</span>
                                        <span className="user-home--event--configure">👥 {event.participants} чел.</span>
                                        <span className="user-home--event--configure">📷 {event.shots}</span>
                                    </div>
                                </Link>
                            ))}
                        </>
                    }
                    {closedEvents.length > 0 &&
                        <>
                            <p className="user-home--events--heading">Прошедшие</p>
                            {closedEvents.map(event => (
                                <Link to={`/event/${event.code}`} key={event.id} className="user-home--event user-home--event__closed">
                                    <h3 className="user-home--event--heading">{event.name}</h3>
                                    <div className="user-home--event--configures">
                                        <span className="user-home--event--configure">📅 {event.date}</span>
                                        <span className="user-home--event--configure">👥 {event.participants} чел.</span>
                                        <span className="user-home--event--configure">📷 {event.shots}</span>
                                    </div>
                                </Link>
                            ))}
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Home
