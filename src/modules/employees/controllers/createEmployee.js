import { Timestamp } from 'firebase-admin/firestore'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { User } from '../../../config/db.collections.js'
import { sendWelcomeEmail } from '../../../utils/sendWelcomeEmail.js'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email format',
    }),
  phone: z.string().regex(/^\+\d{8,15}$/, 'Phone must start with "+" and contain 8–15 digits'),
  isActive: z.boolean().optional(),
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
    const { email, phone } = data

    const [checkEmailSnap, checkPhoneSnap] = await Promise.all([
      email ? User.where('email', '==', email).limit(1).get() : Promise.resolve({ empty: true }),
      User.where('phone', '==', phone).limit(1).get(),
    ])

    if (!checkEmailSnap.empty) {
      return res.status(409).json({ message: 'Email is exist' })
    }

    if (!checkPhoneSnap.empty) {
      return res.status(409).json({ message: 'Phone is exist' })
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

    if (newEmployee.email) {
      await sendWelcomeEmail({
        to: newEmployee.email,
        name: newEmployee.name,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { id, ...newEmployee },
    })
  } catch (err) {
    console.error('create-employee error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
