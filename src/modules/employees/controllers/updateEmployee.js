import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'
import { Task, User } from '../../../config/db.collections.js'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Invalid email' }),
  phone: z.string().regex(/^\+\d{8,15}$/, 'Phone must start with "+" and contain 8–15 digits'),
  isActive: z.boolean().optional(),
})

export async function updateEmployee(req, res) {
  const { id } = req.params
  if (!id) return res.status(400).json({ success: false, message: 'Id is required' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return res.status(400).json({ success: false, errors })
  }

  try {
    const userRef = User.doc(id)
    const doc = await userRef.get()

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const currentData = doc.data()
    const newData = parsed.data

    if (currentData.isActive && newData.isActive === false) {
      const assignedTasks = await Task.where('assignedTo', '==', id).limit(1).get()
      if (!assignedTasks.empty) {
        return res.status(400).json({
          success: false,
          message: 'User is assigned to a task',
        })
      }
    }

    const data = { ...newData, updatedAt: Timestamp.now() }
    await userRef.update(data)

    const updated = await userRef.get()
    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { id: updated.id, ...updated.data() },
    })
  } catch (err) {
    console.error('updateEmployee error:', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
