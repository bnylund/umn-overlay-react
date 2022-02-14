import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EventEmitter } from 'events'
import { StrictMode, createContext } from 'react'
import { render } from 'react-dom'

// Project dependencies
import { AuthService, WebsocketService } from './services'
import { Login, NotFound } from './pages'
import { Overlay } from './overlay'
import reportWebVitals from './reportWebVitals'
import './index.scss'
import { ServiceContext } from './ServiceContext'

// Separate event bus passed into scenes to handle onSceneShow, onSceneHide, etc
const events: EventEmitter = new EventEmitter()

// Keep services outside of render so they don't get initialized more than once
const auth: AuthService = new AuthService()
const websocket: WebsocketService = new WebsocketService(auth, events)

const services = {
  auth,
  websocket,
  events,
}

render(
  <StrictMode>
    <Router>
      <div>
        <ServiceContext.Provider value={services}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Overlay />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ServiceContext.Provider>
      </div>
    </Router>
  </StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
