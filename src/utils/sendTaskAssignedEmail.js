import { sendMail } from '../config/mailer.js'
import dayjs from 'dayjs'

export async function sendTaskAssignedEmail({ to, name = 'there', title, dueDate }) {
  const subject = 'You’ve been assigned a new task!'
  const baseUrl = process.env.WEB_URL || 'http://localhost:5173'
  const taskUrl = `${baseUrl}/dashboard/tasks`

  const dueDateFormatted = dueDate ? dayjs(dueDate).format('DD/MM/YYYY') : 'No due date'

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
      <h2 style="color: #1976d2;">Hello ${name},</h2>

      <p>You’ve just been assigned a new task on <strong>Task Manager</strong></p>

      <p>
        <strong>Title:</strong> ${title} <br/>
        <strong>Due Date:</strong> ${dueDateFormatted}
      </p>

      <a 
        href="${taskUrl}"
        target="_blank"
        style="display: inline-block; padding: 10px 20px; background-color: #388e3c; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;"
       >
       View Task
      </a>

      <p style="margin-top: 30px;">Please check your dashboard for more details.</p>

      <p style="margin-top: 40px;">Best regards,<br/>Task Manager Support Team</p>
    </div>
  `

  return sendMail({ to, subject, html })
}
