import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'
import { Task, User } from '../../../config/db.collections.js'
import { sendTaskAssignedEmail } from '../../../utils/sendTaskAssignedEmail.js'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
})

export async function updateTask(req, res) {
  const io = req.app.get('io')
  const { id } = req.params
  const parsed = schema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    })
  }

  const existing = await Task.doc(id).get()
  if (!existing.exists) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    })
  }

  const { title, description, assignedTo, dueDate } = parsed.data
  const updatedAt = Timestamp.now()

  const updatedTask = {
    ...existing.data(),
    title,
    description: description || '',
    assignedTo: assignedTo || null,
    status: assignedTo ? 'assigned' : 'draft',
    updatedAt,
    dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
  }

  await Task.doc(id).set(updatedTask)

  if (assignedTo) {
    io.to(assignedTo).emit('task-assigned', {
      type: 'task',
      userId: assignedTo,
      payload: updatedTask,
    })

    const assignedUserSnap = await User.doc(assignedTo).get()
    const assignedUser = assignedUserSnap.exists ? assignedUserSnap.data() : null

    if (assignedUser?.email && assignedUser?.name) {
      await sendTaskAssignedEmail({
        to: assignedUser.email,
        name: assignedUser.name,
        dueDate: updatedTask.dueDate,
        title: updatedTask.title,
      })
    }
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask,
  })
}
