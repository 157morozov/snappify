import { Link, useLocation } from "react-router-dom"

import "./style.css"

function Nav() {
    const location = useLocation()

    return (
        <>
            <nav className="user-nav">
                <Link to="/" className={`user-nav--link${location.pathname === '/' ? ' user-nav--link__active' : ''}`}>Мероприятия</Link>
                <Link to="/event/join" className={`user-nav--link${location.pathname === '/event/join' ? ' user-nav--link__active' : '' }`}>Присоединиться</Link>
            <Link to="/profile" className={`user-nav--link${location.pathname === "/profile" ? " user-nav--link__active" : ""}`}>Профиль</Link>
            </nav>
        </>
    )
}

export default Nav
