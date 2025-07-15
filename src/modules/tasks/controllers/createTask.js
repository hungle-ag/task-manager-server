import { Timestamp } from 'firebase-admin/firestore'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { Task, User } from '../../../config/db.collections.js'
import { sendWelcomeEmail } from '../../../utils/sendWelcomeEmail.js'
import { STATUS } from '../../../constants/common.js'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
})

export async function createTask(req, res) {
  try {
    const io = req.app.get('io')
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
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
      status: assignedTo ? STATUS.ASSIGNED : STATUS.DRAFT,
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

      const userSnap = await User.doc(assignedTo).get()
      if (userSnap.exists) {
        const user = userSnap.data()

        if (user?.email && user?.name) {
          await sendWelcomeEmail({
            to: user.email,
            name: user.name,
          })
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    })
  } catch (err) {
    console.error('createTask error:', err)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
