import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import EventEmitter from 'events'

// Project Dependencies
import { AuthService } from './auth.service'
import { Base } from '../types/Live'

export class WebsocketService {
  io: Socket
  loggedIn: boolean = false

  // We will store a local match state for scenes to use
  match: Base.Match =
    process.env.NODE_ENV === 'development'
      ? test_match
      : {
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

  // Fix
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

  registerScene(
    name: string,
    props?: { data: any; handler: Function; buttons?: { name: string; handler: Function }[] },
  ) {
    if (this.loggedIn) {
      this.io.emit('scene:register', name, props ? props.data : undefined)
      if (props) {
        this.io.on('scene:update_data', (sceneName: string, data: any) => {
          if (sceneName === name) {
            props.handler(data)
          }
        })
        this.io.on('scene:execute', (sceneName: string, name: string) => {
          if (sceneName === name && props.buttons) {
            const button = props.buttons.find((x) => x.name === name)
            if (button) button.handler()
          }
        })
      }
    }
  }
}

const test_match: Base.Match = {
  bestOf: 5,
  teamSize: 3,
  hasWinner: false,
  winner: -1,
  id: '',
  stats_id: '',
  game: {
    winner: -1,
    hasWinner: false,
    teams: [
      {
        roster: ['chez', 'bismo', 'mom'],
        colors: {
          primary: '#7a0019',
          secondary: '#ffcc33',
        },
        name: 'UMN Gold',
        avatar: 'https://www.dropbox.com/s/oi3axn8oqbnjcsj/umn.png?dl=1',
        score: 3,
        series: 2,
        players: [
          {
            name: 'chez',
            id: 'chez_1',
            primaryID: 'cheezyrl',
            team: 1,
            score: 525,
            goals: 1,
            shots: 4,
            assists: 2,
            saves: 3,
            touches: 26,
            carTouches: 10,
            hasCar: true,
            demos: 7,
            speed: 60,
            boost: 37,
            isSonic: false,
            isDead: false,
            attacker: '',
            location: {
              x: 5,
              y: 5,
              z: 5,
              yaw: 5,
              roll: 5,
              pitch: 5,
            },
            onWall: false,
            onGround: false,
            isPowersliding: false,
          },
        ],
      },
      {
        roster: ['Lege', 'Rad', 'Slip'],
        colors: {
          primary: '#7a0019',
          secondary: '#ffcc33',
        },
        name: 'UMN Maroon',
        avatar: 'https://www.dropbox.com/s/oi3axn8oqbnjcsj/umn.png?dl=1',
        score: 2,
        series: 1,
        players: [
          {
            name: 'Lege',
            id: 'Lege_2',
            primaryID: 'Lege',
            team: 1,
            score: 525,
            goals: 1,
            shots: 4,
            assists: 2,
            saves: 3,
            touches: 26,
            carTouches: 10,
            hasCar: true,
            demos: 7,
            speed: 60,
            boost: 37,
            isSonic: false,
            isDead: false,
            attacker: '',
            location: {
              x: 5,
              y: 5,
              z: 5,
              yaw: 5,
              roll: 5,
              pitch: 5,
            },
            onWall: false,
            onGround: false,
            isPowersliding: false,
          },
        ],
      },
    ],
    arena: 'DFH Stadium',
    ballSpeed: 50,
    ballTeam: 1,
    hasTarget: true,
    isOT: false,
    isReplay: false,
    target: 'chez_1',
    time: 300,
    ballPosition: {
      x: 1,
      y: 1,
      z: 1,
    },
    id: 'GAME_ID',
  },
}
