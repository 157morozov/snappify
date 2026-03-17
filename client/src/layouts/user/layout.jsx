import Header from "../../components/user/header/component"

import "./style.css"

function User({ children }) {
    return (
        <>
            <Header />
            <div className="user-main">
                {children}
            </div>
        </>
    )
}

export default User
