import { useState } from "react"

import "./style.css"

function EventCreateForm() {
    const [photoCount, setPhotoCount] = useState(20)

    function handlePhotoCount(event) {
        setPhotoCount(event.target.value)
    }

    return (
        <>
            <form className="user-event-create--form">
                <div className="user-event-create--form--container">
                    <label className="user-event-create--form--label" htmlFor="inpEventCreateName">Название</label>
                    <input className="user-event-create--form--input" id="inpEventCreateName" name="eventName" placeholder="Свадьба, день рождения..." required />
                </div>
                <div className="user-event-create--form--container">
                    <label className="user-event-create--form--label">Кадров на гостя</label>
                    <div className="user-event-create--form--range-wrapper">
                        <input className="user-event-create--form--range" name="eventPhotoCount" onChange={handlePhotoCount} type="range" min={1} max={50} defaultValue={20} />
                        <span className="user-event-create--form--range-counter">{photoCount}</span>
                    </div>
                </div>
                <div className="user-event-create--form--boxes">
                    <div className="user-event-create--form--box">
                        <div className="user-event-create--form--box-desc">
                            <p className="user-event-create--form--box-title">Отложенное открытие</p>
                            <p className="user-event-create--form--box-caption">Фото появятся на следующий день</p>
                        </div>
                        <input id="inpEventDelayedPhoto" className="user-event-create--form--box-checkbox" type="checkbox" name="eventDelayedPhoto" hidden />
                        <label htmlFor="inpEventDelayedPhoto" class="user-event-create--form--toggle">
                            <div class="user-event-create--form--toggle-dot"></div>
                        </label>
                    </div>
                    <div className="user-event-create--form--box">
                        <div className="user-event-create--form--box-desc">
                            <p className="user-event-create--form--box-title">Фильтр «плёнка»</p>
                            <p className="user-event-create--form--box-caption">Эффект одноразового фотоаппарата</p>
                        </div>
                        <input id="inpEventOldFilter" className="user-event-create--form--box-checkbox" type="checkbox" name="eventOldFilter" hidden />
                        <label htmlFor="inpEventOldFilter" class="user-event-create--form--toggle">
                            <div class="user-event-create--form--toggle-dot"></div>
                        </label>
                    </div>
                </div>
                <button type="submit" className="button">Создать мероприятие</button>
                <button type="submit" className="button button__outline">Отмена</button>
            </form>
        </>
    )
}

export default EventCreateForm
