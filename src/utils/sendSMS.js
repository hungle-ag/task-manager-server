import { config } from 'dotenv'
import twilio from 'twilio'

config()

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS({ to, text }) {
  if (!to || !text) throw new Error('Missing "to" or "text" parameter')

  try {
    const message = await client.messages.create({
      body: text,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to,
    })
    // console.log('message: ', message)
    return message
  } catch (err) {
    throw err
  }
}
