import { Link } from "react-router-dom"

import IconUser from "../../icons/User"

import "./style.css"

function Header() {
    return (
        <>
            <header className="user-header">
                <div className="user-header--brend">
                    <h1 className="user-header--brend-text">Snap<span>pify</span></h1>
                </div>
                <Link className="user-header--profile" to="/profile">
                    <IconUser />
                </Link>
            </header>
        </>
    )
}

export default Header