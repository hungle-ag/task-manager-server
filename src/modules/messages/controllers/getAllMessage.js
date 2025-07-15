import { Message } from '../../../config/db.collections.js'

export async function getMessages(req, res) {
  const { taskId } = req.query
  if (!taskId) return res.status(400).json({ message: 'Missing task' })

  try {
    const snapshot = await Message.where('taskId', '==', taskId).get()

    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    res.status(200).json({ data: messages, message: 'Get messages successfully', success: true })
  } catch (err) {
    console.error('[GET] /api/messages error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}
