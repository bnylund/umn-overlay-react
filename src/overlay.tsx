import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { Scorebug } from './scenes'
import style from './overlay.module.scss'
import { useServices } from './hooks/services'

export const Overlay: React.FC<any> = (props: any) => {
  const { auth, websocket, events } = useServices()
  const navigate = useNavigate()

  useEffect(() => {
    if (!websocket.loggedIn) {
      if (!websocket.io || !websocket.io.connected) {
        websocket.connect('http://localhost:5555', { autoConnect: false })
        websocket.io.once('connect', () => {
          websocket
            .login()
            .then((inf) => {})
            .catch((err: Error) => {
              console.log(err)
              navigate('/login', { replace: true })
              if (err.message === 'Auth failure') {
              }
            })
        })
        websocket.io.connect()
      } else {
        websocket
          .login()
          .then((inf) => {})
          .catch((err) => {
            console.log(err)
            if (err.message === 'Auth failure') {
              navigate('/login', { replace: true })
            }
          })
      }
    }
  })

  if (!auth.getToken() /* || auth.getToken().length === 0*/) {
    navigate('/login', { replace: true })
  }

  return (
    <div className={style.overlay}>
      <Scorebug />
    </div>
  )
}
