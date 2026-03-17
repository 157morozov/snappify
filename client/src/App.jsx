import { Route, Routes } from "react-router-dom"

import User from "./layouts/user/layout"
import Guest from "./layouts/guest/layout"

import Home from "./pages/home/page"
import Create from "./pages/event/create/page"
import NotFound from "./pages/not-found/page"

import "./assets/global.css"

function App() {
  const routesGuest = [
    {
      "path": "*",
      "element": <NotFound />
    },
  ]

  const routesUser = [
    {
      "path": "/",
      "element": <Home />
    },
    {
      "path": "/event/create",
      "element": <Create />
    },
  ]

  return (
    <>
      <Routes>
        {routesUser.map(route => (
          <Route path={route.path} element={<User>{route.element}</User>} />
        ))}
        {routesGuest.map(route => (
          <Route path={route.path} element={<Guest>{route.element}</Guest>} />
        ))}
      </Routes>
    </>
  )
}

export default App
