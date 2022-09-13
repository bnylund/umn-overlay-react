import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import EventEmitter from 'events'

// Project Dependencies
import { Base } from '../types/Live'

export class WebsocketService {
  io: Socket
  controller?: WebSocket
  loggedIn: boolean = false

  // We will store a local match state for scenes to use
  match: Base.Match = /*process.env.NODE_ENV === 'development'
      ? test_match
      : */ {
    bestOf: 5,
    hasWinner: false,
    winner: -1,
    group_id: '',
  }

  constructor(private events: EventEmitter, server?: string, opts?: Partial<ManagerOptions & SocketOptions>) {
    this.io = io({
      autoConnect: false,
    })
    this.controller = new WebSocket('ws://localhost:24158')

    this.controller.onopen = (ev) => {
      console.log('Connected to controller!')

      if (window.obsstudio) {
        setInterval(() => {
          window.obsstudio.getStatus((status) => {
            window.obsstudio.getCurrentScene((scene) => {
              if (this.controller) {
                this.controller.send(
                  `UPDATE ${JSON.stringify({
                    obsBrowserVersion: window.obsstudio.pluginVersion,
                    status: status.streaming ? 'Streaming' : 'Not Streaming',
                    scene,
                  })}`,
                )
              }
            })
          })
        }, 250)
      }
    }

    // Parse connect messages
    this.controller.onmessage = (ev) => {
      if (ev.data.startsWith('CONNECT ')) {
        const target = ev.data.substring(8)
        console.log('Connecting to ' + target)
        this.connect(target, opts ? { transports: ['websocket'], ...opts } : { transports: ['websocket'] })
        this.io.once('connect', () => {
          this.login(true, 'UMN Overlay')
            .then((val) => {
              console.log('Logged in')
            })
            .catch((err) => {})
        })
        this.io.once('logged_in', () => {
          this.loggedIn = true
        })
      }
    }

    if (server) {
      this.connect(server, opts)
    }
  }

  async login(local: boolean = false, name?: string) {
    return new Promise((resolve: (path: string) => void, reject: (reason?: Error) => void) => {
      if (this.io.connected) {
        if (local) {
          this.io.emit('login', 'OVERLAY', name)
          resolve('')
        } else {
          this.io.emit('login', 'OVERLAY', (path: string) => {
            resolve(path)
          })
        }
      } else {
        this.loggedIn = false
        reject(new Error('Socket not connected'))
      }
    })
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
      this.io.emit(
        'scene:register',
        name,
        props ? props.data : undefined,
        props && props.buttons
          ? props.buttons.map((val, index) => {
              return val.name
            })
          : undefined,
      )
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
  hasWinner: false,
  winner: -1,
  group_id: '',
  game: {
    winner: -1,
    hasWinner: false,
    teams: [
      {
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
            boost: 56,
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
            boost: 56,
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
            boost: 56,
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
