import { EventEmitter } from 'events'
import { useContext } from 'react'
import { ServiceContext } from '../ServiceContext'
import { WebsocketService } from '../services'

export const useWebsocket = () => {
  return useContext(ServiceContext).websocket as WebsocketService
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
    events: EventEmitter
    transition: (cb: () => void) => void
  }
}
