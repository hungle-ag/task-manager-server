import { z } from 'zod'
import { User } from '../../../config/db.collections.js'
import { Timestamp } from 'firebase-admin/firestore'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email',
    }),
  phone: z.string().regex(/^\+\d{8,15}$/, 'Phone must start with "+" and contain 8–15 digits'),
})

export async function updateEmployee(req, res, next) {
  try {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({ success: false, errors })
    }

    const employeeId = req.params.id
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' })
    }

    const userRef = User.doc(employeeId)
    const snapshot = await userRef.get()

    if (!snapshot.exists) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    const data = {
      ...result.data,
      updatedAt: Timestamp.now(),
    }

    await userRef.update(data)

    const updatedSnap = await userRef.get()
    const updatedEmployee = { id: updatedSnap.id, ...updatedSnap.data() }

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    })
  } catch (err) {
    console.error('update-employee error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
