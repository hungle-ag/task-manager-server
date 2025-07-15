import { z } from 'zod'
import { AccessCode, User } from '../../../config/db.collections.js'
import { db } from '../../../config/db.js'
import { generateToken } from '../../../utils/jwt.js'
import { getOtpExpiry } from '../../../utils/optExpiry.js'

const verifyOtpSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 characters')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
  accessCodeId: z.string().min(1, 'accessCodeId is required'),
})

export async function verifyOtpByEmail(req, res) {
  try {
    const parseResult = verifyOtpSchema.safeParse(req.body)

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0].message
      return res.status(400).json({ message: errorMessage })
    }

    const { email, otp, accessCodeId } = parseResult.data

    const accessCodeSnap = await AccessCode.doc(accessCodeId).get()
    if (!accessCodeSnap.exists) {
      return res.status(400).json({ message: 'Expired OTP' })
    }

    const accessCode = accessCodeSnap.data()

    const otpCreationTime = accessCode.createdAt?.toDate?.()
    const isOtpValid =
      accessCode.email === email &&
      accessCode.otp === otp &&
      accessCode.type === 'email' &&
      accessCode.role === 'employee' &&
      accessCode.isUsed === false &&
      otpCreationTime >= getOtpExpiry()

    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    await accessCodeSnap.ref.update({ isUsed: true })

    const oldAccessCodesSnap = await AccessCode.where('email', '==', email)
      .where('isUsed', '==', false)
      .get()

    if (!oldAccessCodesSnap.empty) {
      const batch = db.batch()
      oldAccessCodesSnap.docs.forEach((doc) => {
        if (doc.id !== accessCodeId) {
          batch.delete(doc.ref)
        }
      })
      await batch.commit()
    }

    const userSnap = await User.where('email', '==', email)
      .where('role', '==', 'employee')
      .limit(1)
      .get()

    if (userSnap.empty) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userDoc = userSnap.docs[0]
    const user = { ...userDoc.data(), id: userDoc.id }
    const token = generateToken({ id: user.id, role: user.role })

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully!',
      data: { user, token },
    })
  } catch (err) {
    console.error('verifyOtpByEmail error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
