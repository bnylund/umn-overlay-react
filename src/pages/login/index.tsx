import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRefresh } from '../../hooks/refresh'
import { useWebsocket } from '../../hooks/services'
import style from './login.module.scss'

// Try connecting to Rocketcast client and allow the client to connect this Overlay to a Server
export const Login: React.FC<any> = (props: any) => {
  const ws = useWebsocket()
  const navigate = useNavigate()
  const [server, setServer] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)

  useRefresh(() => {
    if (ws.io && ws.io.connected && ws.loggedIn) {
      navigate('/', { replace: true })
      return
    }
    setConnected(Boolean(ws.controller) && ws.controller!.readyState === ws.controller!.OPEN)
  }, 10)

  if (ws.io && ws.io.connected && ws.loggedIn) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className={style.login}>
      <div>
        <p>Login</p>

        {ws.controller && ws.controller.readyState === ws.controller.OPEN ? (
          <p>Use the Rocketcast app to log in!</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Server address"
              onChange={(e: any) => {
                setServer(e.target.value)
              }}
            />
            <button
              onClick={() => {
                console.log('connecting')
                if (server) {
                  ws.connect(server, {
                    transports: ['websocket'],
                  })
                  ws.io.once('connect', () => {
                    ws.login(true, 'UMN Overlay')
                      .then((val) => {
                        navigate('/', { replace: true })
                      })
                      .catch((err) => {})
                  })
                  ws.io.once('logged_in', () => {
                    ws.loggedIn = true
                    navigate('/')
                  })
                }
              }}
            >
              Connect
            </button>
          </>
        )}
      </div>
    </div>
  )
}
