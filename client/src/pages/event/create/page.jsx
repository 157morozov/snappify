import {Link} from "react-router-dom"

import EventCreateForm from "../../../components/user/event-create-form/component"
import IconBack from "../../../components/icons/Back"

import "./style.css"

function Create() {
    return (
        <>
            <div className="user-event-create">
                <Link to="/" className="link">
                    <IconBack/>
                    Назад
                </Link>
                <h2 className="user-event-create--heading">Новое <span>мероприятие</span></h2>
                <p className="user-event-create--description">Настройте параметры и создайте мероприятие</p>
                <EventCreateForm/>
            </div>
        </>
    )
}

export default Create
