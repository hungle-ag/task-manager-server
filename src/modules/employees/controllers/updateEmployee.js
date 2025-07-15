import { z } from 'zod'
import { User } from '../../../config/db.collections.js'
import { Timestamp } from 'firebase-admin/firestore'

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
  if (!id) return res.status(400).json({ success: false, message: 'Employee ID is required' })

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
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    const data = { ...parsed.data, updatedAt: Timestamp.now() }
    console.log('data: ', data)
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
