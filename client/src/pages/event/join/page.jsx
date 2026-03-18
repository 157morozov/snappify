import {Link} from "react-router-dom"

import Nav from "../../../components/user/nav/component.jsx"
import QRCode from "../../../components/icons/QRCode.jsx"

import "./style.css"

function Join() {
    return (
        <>
            <Nav/>
            <div className="user-event-join">
                <h2 className="user-event-join--heading">Поиск <span>мероприятия</span></h2>
                <p className="user-event-join--description">Введите код или отсканируйте QR</p>
                <div className="space--small"></div>
                <form className="user-event-join--form">
                    <div className="user-event-join--form--container">
                        <label className="user-event-join--form--label" htmlFor="inpEventJoinCode">Код мероприятия</label>
                        <input className="user-event-join--form--input" id="inpEventJoinCode" name="eventCode" placeholder="GxFs0z" minLength={6} maxLength={6} required/>
                    </div>
                    <button type="submit" className="button">Войти</button>
                </form>
                <div className="space--small"></div>
                <div className="user-event-join--separator">
                    <hr/>
                    <span>Или</span>
                </div>
                <div className="space--small"></div>
                <div className="user-event-join--qr">
                    <div className="user-event-join--qr-code">
                        <QRCode/>
                    </div>
                    <h3 className="user-event-join--qr--heading">Сканировать QR-код</h3>
                    <p className="user-event-join--qr--caption">Наведите камеру на QR организатора</p>
                    <div className="space--small"></div>
                    <Link to="/event/join/qr" className="user-event-join--qr--link button button__outline">Открыть камеру</Link>
                </div>
            </div>
        </>
    )
}

export default Join
