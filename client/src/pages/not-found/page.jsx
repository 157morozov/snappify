import { Link } from "react-router-dom"

import IconBack from "../../components/icons/Back"

import "./style.css"

function NotFound() {
    return (
        <>
            <div className="not-found">
                <p className="not-found--code">404</p>
                <h1 className="not-found--heading">Страница не найдена</h1>
                <Link to="/" className="link">
                    <IconBack />
                    Домой
                </Link>
            </div>
        </>
    )
}

export default NotFound