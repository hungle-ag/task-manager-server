import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
})

export async function sendMail({ to, subject, html }) {
  const mailOptions = {
    from: `"Task Manager App support team" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  }

  return transporter.sendMail(mailOptions)
}
