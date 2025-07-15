import { config } from 'dotenv'
import { hasRecentPhoneOtp, sendOtpByPhone } from '../service/opt.service.js'
import { z } from 'zod'

export const schema = z.object({
  phone: z.string().regex(/^\+\d{8,15}$/, 'Phone must start with "+" and contain 8–15 digits'),
})

config()

export async function loginByPhone(req, res) {
  try {
    const parseResult = schema.safeParse(req.body)

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0].message
      return res.status(400).json({ message: errorMessage })
    }

    const { phone } = parseResult.data

    const recentlySent = await hasRecentPhoneOtp(phone)
    if (recentlySent) {
      return res.status(429).json({
        message: 'OTP already sent. Try again in 3 minutes',
      })
    }

    // send OTP
    const { otp, id: accessCodeId } = await sendOtpByPhone(phone)

    const responsePayload = {
      success: true,
      message: 'OTP sent successfully',
      data: {
        accessCodeId,
        phone,
      },
    }
    // Dev only — don't show this to production
    if (process.env.NODE_ENV === 'dev') {
      responsePayload.data.otp = otp
    }

    return res.status(200).json(responsePayload)
  } catch (err) {
    console.error('loginByPhone error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
