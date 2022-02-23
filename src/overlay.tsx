import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Match, Postgame } from './scenes'
import { useServices } from './hooks/services'

export const Overlay: React.FC<any> = (props: any) => {
  const { auth, websocket, events } = useServices()
  const [loggedIn, setLoggedIn] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!websocket.loggedIn) {
      if (!websocket.io || !websocket.io.connected) {
        websocket.connect('http://localhost:9000', {
          autoConnect: false,
          transports: ['websocket'],
          upgrade: false,
        })
        websocket.io.once('connect', () => {
          websocket
            .login()
            .then((inf) => {
              console.log('Connected!', inf)
              websocket.io.emit('get match info', (match: any, err?: Error) => {
                if (!err) {
                  websocket.match = match
                  setLoggedIn(true)
                }
              })
            })
            .catch((err: Error) => {
              console.log(err)
              //navigate('/login', { replace: true })
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
              //navigate('/login', { replace: true })
            }
          })
      }
    }
  }, [refresh])

  /*if (!auth.getToken()) {
    navigate('/login', { replace: true })
  }*/

  //if (!websocket.loggedIn) return null

  return (
    <div>
      <Match />
      <Postgame />
    </div>
  )
}
