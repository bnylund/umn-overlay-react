import EventEmitter from 'events'
import { createContext } from 'react'
import { AuthService, WebsocketService } from './services'

export interface Services {
  auth: AuthService | null
  websocket: WebsocketService | null
  events: EventEmitter | null
}

export const ServiceContext = createContext<Services>({ auth: null, websocket: null, events: null })
