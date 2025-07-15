import { config } from 'dotenv'
import { db } from '../../../config/db.js'
import { hasRecentEmailOtp, sendOtpByEmail } from '../service/opt.service.js'
import { User } from '../../../config/db.collections.js'

config()

export async function loginByEmail(req, res, next) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const userSnap = await User.where('email', '==', email)
      .where('role', '==', 'employee')
      .limit(1)
      .get()

    if (userSnap.empty) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const recentlySent = await hasRecentEmailOtp(email)

    if (recentlySent) {
      return res.status(429).json({
        message: 'OTP already sent. Try again in a few minutes',
      })
    }

    const { otp, id } = await sendOtpByEmail(email)

    return res.status(200).json({
      success: true,
      message: 'OTP sent via email',
      data: {
        email,
        accessCodeId: id,
        ...(process.env.NODE_ENV === 'dev' && { otp }),
      },
    })
  } catch (err) {
    console.error('login-by-mail error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
