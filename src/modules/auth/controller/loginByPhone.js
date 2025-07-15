import { config } from 'dotenv'
import { hasRecentPhoneOtp, sendOtpByPhone } from '../service/opt.service.js'

config()

export async function loginByPhone(req, res, next) {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' })
    }

    const recentlySent = await hasRecentPhoneOtp(phone)

    if (recentlySent) {
      return res.status(429).json({
        message: 'OTP already sent. Try again in a few minutes',
      })
    }

    const { otp, id } = await sendOtpByPhone(phone)

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully!',
      data: {
        accessCodeId: id,
        phone,
        ...(process.env.NODE_ENV === 'dev' && { otp }),
      },
    })
  } catch (err) {
    console.error('login-by-phone error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
