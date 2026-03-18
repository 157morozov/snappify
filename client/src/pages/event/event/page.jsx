import {Link, useParams} from "react-router-dom"

import {initialEvents} from "../../../data/mock.js"
import {DOMAIN_NAME} from "../../../data/constants.js"

import IconBack from "../../../components/icons/Back"
import QRCode from "../../../components/icons/QRCode.jsx"

import "./style.css"

function Event() {
    function formatCountdown(revealAt) {
        const diff = Math.max(0, revealAt - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const params = useParams()
    const code = params.code
    const event = initialEvents.find(event => event.code === code)
    const eventUrl = `${DOMAIN_NAME}/event/${event.code}`

    if (!event) return (
        <>
            lox
        </>
    )

    async function handleCodeCopy() {
        try {
            await navigator.clipboard.writeText(`https://${eventUrl}`)
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    return (
        <>
            <div className="user-event">
                <Link to="/" className="link">
                    <IconBack/>
                    Все мероприятия
                </Link>
                <h2 className="user-event--heading">{event.name}</h2>
                <p className="user-event--date">{event.date}</p>
                <div className="user-event--configures">
                    <div className="user-event--configure">
                        <span className="user-event--configure--number">{event.photos.length}</span>
                        <span className="user-event--configure--caption">Фото</span>
                    </div>
                    <div className="user-event--configure">
                        <span className="user-event--configure--number">{event.participants}</span>
                        <span className="user-event--configure--caption">Гостей</span>
                    </div>
                    <div className="user-event--configure">
                        <span className="user-event--configure--number">{event.shots}</span>
                        <span className="user-event--configure--caption">Кадров</span>
                    </div>
                </div>
                <div className="user-event--invite">
                    <div className="user-event--invite--qr">
                        <QRCode/>
                    </div>
                    <div className="user-event--invite--description">
                        <span className="user-event--invite--heading">Пригласить гостей</span>
                        <span className="user-event--invite--url">{eventUrl}</span>
                    </div>
                    <button onClick={handleCodeCopy} type="button" className="user-event--invite--copy button button__outline">
                        Копировать
                    </button>
                </div>
                <Link to={`/event/${event.code}/camera`} className="button">+ Сделать фото</Link>
            </div>
        </>
    )
}

export default Event