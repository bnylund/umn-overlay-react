import EventEmitter from 'events'
import { createContext } from 'react'
import { WebsocketService } from './services'

export interface Services {
  websocket: WebsocketService | null
  events: EventEmitter | null
  transition: ((cb: () => void) => void) | null
}

export const ServiceContext = createContext<Services>({ websocket: null, events: null, transition: null })
