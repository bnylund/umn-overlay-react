/// <reference types="obs-studio" />

declare interface Overlay {
  _id: string
}

declare interface Server {
  pid: number
  port: number
  log: string
  stats?: {
    cpu: number
    memory: number
    ppid: number
    pid: number
    ctime: number
    elapsed: number
    timestamp: number
  }
}
