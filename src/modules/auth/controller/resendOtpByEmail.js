import { hasRecentEmailOtp, sendOtpByEmail } from '../service/opt.service.js'
import { z } from 'zod'

const schema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
})

export async function resendOtpByEmail(req, res) {
  try {
    const parseResult = schema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message })
    }

    const { email } = parseResult.data

    const recentlySent = await hasRecentEmailOtp(email)
    if (recentlySent) {
      return res.status(429).json({ message: 'OTP already sent. Please wait' })
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
    console.error('resendOtpByEmail error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
