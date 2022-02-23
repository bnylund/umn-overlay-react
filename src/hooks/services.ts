import { EventEmitter } from 'events'
import { useContext } from 'react'
import { ServiceContext } from '../ServiceContext'
import { AuthService, WebsocketService } from '../services'

export const useWebsocket = () => {
  return useContext(ServiceContext).websocket as WebsocketService
}

export const useAuth = () => {
  return useContext(ServiceContext).auth as AuthService
}

export const useEvents = () => {
  return useContext(ServiceContext).events as EventEmitter
}

export const useTransition = () => {
  return useContext(ServiceContext).transition as (cb: () => void) => void
}

export const useServices = () => {
  return useContext(ServiceContext) as {
    websocket: WebsocketService
    auth: AuthService
    events: EventEmitter
    transition: (cb: () => void) => void
  }
}
