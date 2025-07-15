import { Message } from '../../../config/db.collections.js'
import { Timestamp } from 'firebase-admin/firestore'
import { v4 as uuid } from 'uuid'

export const createMessage = (io, socket) => {
  socket.on('createMessage', async (data) => {
    try {
      const { taskId, createdBy, name, content } = data
      if (!taskId || !createdBy || !name || !content) {
        socket.emit('error', { message: 'Missing fields in createMessage' })
        return
      }

      const id = uuid()
      const newMessage = {
        id,
        taskId,
        createdBy,
        name,
        content,
        createdAt: Timestamp.now().toDate().toISOString(),
      }

      await Message.doc(id).set(newMessage)
      const savedMessage = { ...newMessage }

      io.to(`task_conversation_${taskId}`).emit('newMessage', savedMessage)
    } catch (err) {
      console.error('createMessage error:', err)
      socket.emit('error', { message: 'Failed to create message' })
    }
  })
}
