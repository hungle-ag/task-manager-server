import { hasRecentEmailOtp, sendOtpByEmail } from '../service/opt.service.js'

export async function resendOtpByEmail(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const recentlySent = await hasRecentEmailOtp(email)
    if (recentlySent) {
      return res.status(429).json({ message: 'OTP already sent. Please wait.' })
    }

    const { otp, id } = await sendOtpByEmail(email)

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        accessCodeId: id,
        email,
        ...(process.env.NODE_ENV === 'dev' && { otp }),
      },
    })
  } catch (err) {
    console.error('resendOtpByEmail error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
