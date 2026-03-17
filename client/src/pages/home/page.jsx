import { useState } from "react"
import { Link } from "react-router-dom"

import { initialEvents } from "../../data/mock"

import Nav from "../../components/user/nav/component"

import "./style.css"

function Home() {
    const [events, setEvents] = useState(initialEvents)

    const activeEvents = events.filter(e => e.status !== 'closed');
    const closedEvents = events.filter(e => e.status === 'closed');

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
                                <div key={event.id} className="user-home--event">

                                </div>
                            ))}
                        </>
                    }
                    {closedEvents.length > 0 &&
                        <>
                            <p className="user-home--events--heading">Прошедшие</p>
                            {activeEvents.map(event => (
                                <div key={event.id} className="user-home--event">

                                </div>
                            ))}
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Home
