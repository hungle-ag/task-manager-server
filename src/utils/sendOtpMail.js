import { sendMail } from '../config/mailer.js'

export async function sendOtpEmail({ to, otpCode }) {
  const subject = 'Your OTP Code'
  const html = `
    <div style="font-family: sans-serif; font-size: 16px;">
      <p>Hello 👋,</p>
      <p>Your verification code is:</p>
      <h2 style="color: #007bff;">${otpCode}</h2>
      <p>This code will expire in 3 minutes.</p>
      <br/>
      <p>Best regards,<br/>Task Manager App</p>
    </div>
  `

  return sendMail({ to, subject, html })
}
