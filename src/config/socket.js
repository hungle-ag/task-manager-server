import { Server } from 'socket.io'

let ioInstance

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  return ioInstance
}

export function getSocket() {
  if (!ioInstance) throw new Error('Socket.io not initialized')
  return ioInstance
}
