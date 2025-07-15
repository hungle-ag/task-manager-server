import { Timestamp } from 'firebase-admin/firestore'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { AccessCode, User } from '../../../config/db.collections.js'
import { db } from '../../../config/db.js'
import { generateToken } from '../../../utils/jwt.js'
import { getOtpExpiry } from '../../../utils/optExpiry.js'

const verifyOtpPhoneSchema = z.object({
  phone: z.string().regex(/^\+\d{8,15}$/, 'Phone must start with "+" and contain 8–15 digits'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 characters')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
  accessCodeId: z.string().min(1, 'accessCodeId is required'),
})

export async function verifyOtpByPhone(req, res) {
  try {
    const parseResult = verifyOtpPhoneSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message })
    }

    const { phone, otp, accessCodeId } = parseResult.data

    const accessCodeSnap = await AccessCode.doc(accessCodeId).get()
    if (!accessCodeSnap.exists) {
      return res.status(400).json({ message: 'Expired OTP' })
    }

    const accessCode = accessCodeSnap.data()
    const otpCreatedAt = accessCode.createdAt?.toDate?.()

    const isValidOtp =
      accessCode.phone === phone &&
      accessCode.otp === otp &&
      accessCode.type === 'sms' &&
      accessCode.role === 'manager' &&
      accessCode.isUsed === false &&
      otpCreatedAt >= getOtpExpiry()

    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    await accessCodeSnap.ref.update({ isUsed: true })

    const oldAccessCodesSnap = await AccessCode.where('phone', '==', phone)
      .where('isUsed', '==', false)
      .get()

    if (!oldAccessCodesSnap.empty) {
      const batch = db.batch()
      oldAccessCodesSnap.docs.forEach((doc) => {
        if (doc.id !== accessCodeId) batch.delete(doc.ref)
      })
      await batch.commit()
    }

    const userSnap = await User.where('phone', '==', phone)
      .where('role', '==', 'manager')
      .limit(1)
      .get()

    let user
    if (userSnap.empty) {
      const id = uuid()
      user = {
        id,
        phone,
        email: null,
        name: '',
        role: 'manager',
        verified: true,
        createdAt: Timestamp.now(),
      }
      await User.doc(id).set(user)
    } else {
      const doc = userSnap.docs[0]
      user = { ...doc.data(), id: doc.id }
    }

    const token = generateToken({ id: user.id, role: user.role })

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: { user, token },
    })
  } catch (err) {
    console.error('verifyOtpByPhone error:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
