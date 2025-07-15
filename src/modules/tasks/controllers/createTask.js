import { Timestamp } from 'firebase-admin/firestore'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { Task, User } from '../../../config/db.collections.js'
import { sendWelcomeEmail } from '../../../utils/sendWelcomeEmail.js'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
})

export async function createTask(req, res) {
  const io = req.app.get('io')
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

  const { title, description, assignedTo, dueDate } = parsed.data
  const id = uuid()
  const now = Timestamp.now()

  const task = {
    id,
    title,
    description: description || '',
    assignedTo: assignedTo || null,
    status: assignedTo ? 'assigned' : 'draft',
    createdBy: req.user?.id || null,
    createdAt: now,
    updatedAt: now,
    dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
  }

  await Task.doc(id).set(task)

  if (assignedTo) {
    io.to(assignedTo).emit('task-assigned', {
      type: 'task',
      userId: assignedTo,
      payload: task,
    })

    const assignedUserSnap = await User.doc(assignedTo).get()
    const assignedUser = assignedUserSnap.exists ? assignedUserSnap.data() : null

    if (assignedUser?.email && assignedUser?.name) {
      await sendWelcomeEmail({
        to: assignedUser.email,
        name: assignedUser.name,
      })
    }
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  })
}
