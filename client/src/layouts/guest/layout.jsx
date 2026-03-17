import Header from "../../components/guest/header/component"

import "./style.css"

function Guest({ children }) {
    return (
        <>
            <Header />
            <div className="guest-main">
                {children}
            </div>
        </>
    )
}

export default Guest
