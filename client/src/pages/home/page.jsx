import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../../api"

import Nav from "../../components/user/nav/component"

import "./style.css"

function statusKey(event) {
    const now = Date.now()
    const start = event.start_at ? new Date(event.start_at).getTime() : null
    const end = event.end_at ? new Date(event.end_at).getTime() : null
    if (start && end && now >= start && now <= end) return "active"
    if (start && now < start) return "planned"
    if (end && now > end) return "finished"
    return "planned"
}

function byDateAsc(a, b) {
    const ad = new Date(a.start_at || a.created_at || 0).getTime()
    const bd = new Date(b.start_at || b.created_at || 0).getTime()
    return ad - bd
}

function Home() {
    const [events, setEvents] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/auth'); return }
        api.events().then(setEvents).catch(err => setError(err.message)).finally(() => setLoading(false))
    }, [navigate])

    const groups = useMemo(() => {
        const active = events.filter(e => statusKey(e) === 'active').sort(byDateAsc)
        const planned = events.filter(e => statusKey(e) === 'planned').sort(byDateAsc)
        const finished = events.filter(e => statusKey(e) === 'finished').sort(byDateAsc)
        return [
            {title:'В процессе', items: active},
            {title:'Запланировано', items: planned},
            {title:'Завершено', items: finished},
        ]
    }, [events])

    return <>
        <Nav />
        <div className="user-home">
            <Link to="/event/create" className="button">+ Новое мероприятие</Link>
            {error && <p className='auth-error'>{error}</p>}
            {loading && <div className='skeleton-list'>{Array.from({length:3}).map((_,i)=><div key={i} className='skeleton-card'/>)}</div>}
            {!loading && <div className="user-home--events">
                {groups.map(group => group.items.length > 0 && <div key={group.title}>
                    <p className='user-home--events--heading'>{group.title}</p>
                    {group.items.map(event => (
                        <Link to={`/event/${event.code}`} key={event.id} className="user-home--event user-home--event__active">
                            <h3 className="user-home--event--heading">{event.name}</h3>
                            <div className="user-home--event--configures">
                                <span className="user-home--event--configure">📷 {event.shots_limit}</span>
                                <span className="user-home--event--configure">🔓 {event.reveal_mode}</span>
                            </div>
                        </Link>
                    ))}
                </div>)}
            </div>}
        </div>
    </>
}

export default Home
