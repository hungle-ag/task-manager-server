import { sendMail } from '../config/mailer.js'

export async function sendWelcomeEmail({ to, name = 'there' }) {
  const subject = 'Welcome to Task Manager!!!'

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
      <h2 style="color: #1976d2;">Hello ${name},</h2>

      <p>You’ve been added to the <strong>Task Manager</strong> platform as an employee.</p>

      <p>To get started, please log in using your phone number. You will receive a one-time code (OTP) for verification.</p>

      <a href="http://localhost:5173/auth/employee-login"
         target="_blank"
         style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">
        Go to Employee Login ...
      </a>

      <p style="margin-top: 30px;">If you did not expect this email, you can safely ignore it.</p>

      <p style="margin-top: 40px;">Best regards,<br/>Task Manager Support Team</p>
    </div>
  `

  return sendMail({ to, subject, html })
}
