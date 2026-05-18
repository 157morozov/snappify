import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import {SystemModalProvider} from './components/system/modal/context'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SystemModalProvider>
      <App />
    </SystemModalProvider>
  </BrowserRouter>
)
