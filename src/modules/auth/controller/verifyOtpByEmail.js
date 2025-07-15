import { AccessCode, User } from '../../../config/db.collections.js'
import { db } from '../../../config/db.js'
import { generateToken } from '../../../utils/jwt.js'
import { getOtpExpiry } from '../../../utils/optExpiry.js'

export async function verifyOtpByEmail(req, res, next) {
  try {
    const { email, otp, accessCodeId } = req.body

    if (!email || !otp || !accessCodeId) {
      return res.status(400).json({ message: 'Email, OTP, and accessCodeId are required.' })
    }

    const accessCodeSnap = await AccessCode.doc(accessCodeId).get()
    if (!accessCodeSnap.exists) {
      return res.status(400).json({ message: 'Expired OTP.' })
    }

    const accessCode = accessCodeSnap.data()
    const isValid =
      accessCode.email === email &&
      accessCode.otp === otp &&
      accessCode.type === 'email' &&
      accessCode.role === 'employee' &&
      accessCode.isUsed === false &&
      accessCode.createdAt?.toDate?.() >= getOtpExpiry()

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' })
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
      return res.status(404).json({ message: 'User not found.' })
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
    console.error('verify-otp-by-email error:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
