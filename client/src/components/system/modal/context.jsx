/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useMemo, useState} from 'react'
import './style.css'

const ModalContext = createContext({ showMessage: () => {} })

export function SystemModalProvider({children}) {
  const [state, setState] = useState({ open: false, title: '', text: '', type: 'info' })

  const showMessage = ({title, text, type = 'info'}) => {
    setState({ open: true, title, text, type })
  }

  const close = () => setState(prev => ({ ...prev, open: false }))

  const value = useMemo(() => ({ showMessage, close }), [])

  return <ModalContext.Provider value={value}>
    {children}
    {state.open && <div className='system-modal-backdrop' onClick={close}>
      <div className={`system-modal system-modal__${state.type}`} onClick={e => e.stopPropagation()}>
        <h4>{state.title}</h4>
        <p>{state.text}</p>
        <button className='button' onClick={close}>Понятно</button>
      </div>
    </div>}
  </ModalContext.Provider>
}

export function useSystemModal() {
  return useContext(ModalContext)
}
