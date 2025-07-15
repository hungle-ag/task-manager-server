import { createMessage } from '../modules/messages/controllers/createMessage.js'

export function joinRoom(io) {
  io.on('connection', (socket) => {
    socket.on('joinRoom', (userId) => {
      socket.join(userId)
      console.log(`${socket.id} joined room ${userId}`)
    })

    socket.on('joinTaskConversation', (taskId) => {
      socket.join(`task_conversation_${taskId}`)
      console.log(`Socket ${socket.id} joined task room task_conversation_${taskId}`)
    })

    createMessage(io, socket)
  })
}
