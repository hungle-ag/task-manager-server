import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'
import { Task, User } from '../../../config/db.collections.js'
import { STATUS } from '../../../constants/common.js'
import { sendTaskAssignedEmail } from '../../../utils/sendTaskAssignedEmail.js'
import dayjs from 'dayjs'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  status: z
    .enum([STATUS.DRAFT, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.CANCELED, STATUS.DONE])
    .optional(),
})

export async function updateTask(req, res) {
  try {
    const io = req.app.get('io')
    const { id } = req.params
    const user = req.user

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

    const existingSnap = await Task.doc(id).get()
    if (!existingSnap.exists) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const oldTask = existingSnap.data()
    const { title, description, assignedTo, dueDate, status } = parsed.data

    const updatedTask = {
      ...oldTask,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
      status: status || (assignedTo ? STATUS.ASSIGNED : STATUS.DRAFT),
      updatedAt: Timestamp.now(),
    }

    await Task.doc(id).set(updatedTask)

    if (assignedTo) {
      const targetUserId = user.role === 'manager' ? assignedTo : updatedTask.createdBy
      io.to(targetUserId).emit('task-assigned', {
        type: 'task',
        userId: assignedTo,
        payload: updatedTask,
      })

      const userSnap = await User.doc(assignedTo).get()
      if (userSnap.exists) {
        const user = userSnap.data()
        if (user?.email && user?.name) {
          await sendTaskAssignedEmail({
            to: user.email,
            name: user.name,
            dueDate: dayjs(updatedTask.dueDate.toDate()).format('DD/MM/YYYY'),
            title: updatedTask.title,
          })
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    })
  } catch (err) {
    console.error('updateTask error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
