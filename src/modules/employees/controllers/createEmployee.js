import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { User } from '../../../config/db.collections.js'
import { Timestamp } from 'firebase-admin/firestore'
import { sendWelcomeEmail } from '../../../utils/sendWelcomeEmail.js'

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

export async function createEmployee(req, res) {
  try {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({ success: false, errors })
    }

    const data = result.data

    const checkExit = await User.where('email', '==', data.email).limit(1).get()
    if (!checkExit.empty) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const id = uuid()

    const newEmployee = {
      ...data,
      id,
      role: 'employee',
      isActive: true,
      createdAt: Timestamp.now(),
    }

    await User.doc(id).set(newEmployee)

    await sendWelcomeEmail({ to: newEmployee.email, name: newEmployee.name })

    return res.status(201).json({
      success: true,
      data: { id, ...newEmployee },
      message: 'Employee created successfully',
    })
  } catch (err) {
    console.error('create-employee error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
