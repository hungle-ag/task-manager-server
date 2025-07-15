import { config } from 'dotenv'
import { User } from '../../../config/db.collections.js'
import { hasRecentEmailOtp, sendOtpByEmail } from '../service/opt.service.js'
import { z } from 'zod'

config()

const schema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
})

export async function loginByEmail(req, res) {
  try {
    const parseResult = schema.safeParse(req.body)
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0].message
      return res.status(400).json({ message: errorMessage })
    }

    const { email } = parseResult.data

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
        message: 'OTP already sent. Try again in 3 minutes',
      })
    }

    // send OTP
    const { otp, id: accessCodeId } = await sendOtpByEmail(email)

    const responsePayload = {
      success: true,
      message: 'OTP sent successfully',
      data: {
        accessCodeId,
        email,
      },
    }

    // Dev only — don't show this to production
    if (process.env.NODE_ENV === 'dev') {
      responsePayload.data.otp = otp
    }

    return res.status(200).json(responsePayload)
  } catch (err) {
    console.error('loginByEmail error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
