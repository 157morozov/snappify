import {Route, Routes} from "react-router-dom"

import User from "./layouts/user/layout"
import Guest from "./layouts/guest/layout"

import Home from "./pages/home/page"
import Create from "./pages/event/create/page"
import Join from "./pages/event/join/page"
import Event from "./pages/event/event/page"
import AuthPage from "./pages/auth/page"
import NotFound from "./pages/not-found/page"
import VerifyPage from "./pages/auth/verify/page"
import ProfilePage from "./pages/profile/page"

import "./assets/global.css"

function App() {
    const routesGuest = [
        { path: "/auth", element: <AuthPage/> },
        { path: "/auth/verify", element: <VerifyPage/> },
        { path: "*", element: <NotFound/> },
    ]

    const routesUser = [
        { path: "/", element: <Home/> },
        { path: "/event/create", element: <Create/> },
        { path: "/event/join", element: <Join/> },
        { path: "/event/:code", element: <Event/> },
        { path: "/profile", element: <ProfilePage/> },
    ]

    return (
        <Routes>
            {routesUser.map(route => (
                <Route key={route.path} path={route.path} element={<User>{route.element}</User>}/>
            ))}
            {routesGuest.map(route => (
                <Route key={route.path} path={route.path} element={<Guest>{route.element}</Guest>}/>
            ))}
        </Routes>
    )
}

export default App
