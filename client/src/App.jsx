import {Route, Routes} from "react-router-dom"

import User from "./layouts/user/layout"
import Guest from "./layouts/guest/layout"

import Home from "./pages/home/page"
import Create from "./pages/event/create/page"
import Join from "./pages/event/join/page.jsx";
import Event from "./pages/event/event/page.jsx";
import NotFound from "./pages/not-found/page"

import "./assets/global.css"

function App() {
    const routesGuest = [
        {
            "path": "*",
            "element": <NotFound/>
        },
    ]

    const routesUser = [
        {
            "path": "/",
            "element": <Home/>
        },
        {
            "path": "/event/create",
            "element": <Create/>
        },
        {
            "path": "/event/join",
            "element": <Join/>
        },
        {
            "path": "/event/:code",
            "element": <Event/>
        },
    ]

    return (
        <>
            <Routes>
                {routesUser.map(route => (
                    <Route path={route.path} element={<User>{route.element}</User>}/>
                ))}
                {routesGuest.map(route => (
                    <Route path={route.path} element={<Guest>{route.element}</Guest>}/>
                ))}
            </Routes>
        </>
    )
}

export default App
