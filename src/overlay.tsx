import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWebsocket } from './hooks/services'

import { Match, Postgame } from './scenes'

export const Overlay: React.FC<any> = (props: any) => {
  const ws = useWebsocket()
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    if (!ws.io || !ws.io.connected || !ws.loggedIn) {
      navigate('/login', { replace: true })
    }
    const disconnectHandler = () => {
      navigate('/login', { replace: true })
    }

    ws.io.once('disconnect', disconnectHandler)

    return () => {
      ws.io.off('disconnect', disconnectHandler)
    }
  }, [refresh])

  if (!ws.io || !ws.io.connected || !ws.loggedIn) return null
  return (
    <div>
      <Match />
      <Postgame />
    </div>
  )
}
