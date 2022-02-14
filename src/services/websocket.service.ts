import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import EventEmitter from 'events'

// Project Dependencies
import { AuthService } from './auth.service'
import { Base } from '../types/Live'

/*

  TODO:
    - Make a system to allow the control board to set variables inside of scenes using text fields, images, etc.
    - Allowed types: string, number, boolean, Team, Player, League, Season, Match, Game
    
    - CB: When an array is found, grab the first element in the array and recursively generate visual elements to modify the values

    ex.
    format: {
      "match_title": string,
      "background": string,
      "teams": [
        {
          "name": string,
          "series": number,
          "players": [
            {
              "name": string,
              "score": number,
              "platforms": [
                {
                  "name": string
                  "id": string
                }
              ]
            }
          ]
        }
      ]
    }

*/
export class WebsocketService {
  io: Socket
  loggedIn: boolean = false

  // We will store a local match state for scenes to use
  match: Base.Match = {
    bestOf: 5,
    teamSize: 3,
    hasWinner: false,
    winner: -1,
    id: '',
    stats_id: '',
  }

  constructor(
    private auth: AuthService,
    private events: EventEmitter,
    server?: string,
    opts?: Partial<ManagerOptions & SocketOptions>,
  ) {
    this.io = io({
      autoConnect: false,
    })
    if (server) {
      this.connect(server, opts)
    }
  }

  async login() {
    return new Promise(
      (
        resolve: (info: { name: string; version: string; author: string }) => void,
        reject: (reason?: Error) => void,
      ) => {
        if (this.io.connected) {
          this.io.emit(
            'login',
            this.auth.getToken(),
            'CONTROLBOARD',
            (status: string, info: { name: string; version: string; author: string }) => {
              if (status !== 'good') {
                this.loggedIn = false
                reject(new Error('Auth failure'))
              }
              this.events.emit('socket:logged_in')
              this.loggedIn = true
              this.registerListeners()
              resolve(info)
            },
          )
        } else {
          this.loggedIn = false
          reject(new Error('Socket not connected'))
        }
      },
    )
  }

  connect(server: string, opts?: Partial<ManagerOptions & SocketOptions>) {
    this.disconnect()
    this.io = io(server, opts)
  }

  disconnect() {
    this.loggedIn = false
    if (this.io && this.io.connected) {
      this.events.emit('socket:disconnected')
      this.io.disconnect()
    }
  }

  // put internal listeners here
  registerListeners() {
    this.io.on('match:update_state', (state: Base.Match) => {
      this.match = state
    })
    this.io.on('scene:visibility', (name: string, state: boolean, transition: boolean = false) => {
      this.events.emit('scene:visibility', name, state, transition)
    })
  }

  registerScene(name: string, dataFeed?: { format: any; handler: Function }) {
    if (this.loggedIn) {
      this.io.emit('scene:register', name, dataFeed ? dataFeed.format : undefined)
      if (dataFeed) {
        this.io.on('scene:update_data', (sceneName: string, data: any) => {
          if (sceneName === name) {
            dataFeed.handler(data)
          }
        })
      }
    }
  }
}
