import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EventEmitter } from 'events'
import { StrictMode, createContext } from 'react'
import { render } from 'react-dom'

// Project dependencies
import { AuthService, WebsocketService } from './services'
import { ServiceContext } from './ServiceContext'
import { Login, NotFound } from './pages'
import { Overlay } from './overlay'
import transition from './assets/transition.webm'
import reportWebVitals from './reportWebVitals'
import './index.scss'
import 'animate.css'

// Separate event bus passed into scenes to handle onSceneShow, onSceneHide, etc
const events: EventEmitter = new EventEmitter()

// Keep services outside of render so they don't get initialized more than once
const auth: AuthService = new AuthService()
const websocket: WebsocketService = new WebsocketService(auth, events)

const services = {
  auth,
  websocket,
  events,
  transition: (cb: () => void) => {
    const elm = document.querySelector<HTMLVideoElement>('#overlay-transition')
    if (!elm) {
      cb()
      return
    }

    // Set z-index so we can right click + inspect without it going straight to the video element
    elm.style.zIndex = '99'
    elm.play().then((val) => {
      setTimeout(cb, (elm.duration * 1000) / 2)
      setTimeout(() => {
        elm.style.zIndex = '-5'
      }, elm.duration * 1000)
    })
  },
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
        <video width="1920" height="1080" muted={true} id="overlay-transition">
          <source src={transition} type="video/webm" />
        </video>
      </div>
    </Router>
  </StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
