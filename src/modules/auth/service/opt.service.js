import { v4 as uuid } from 'uuid'
import { AccessCode } from '../../../config/db.collections.js'
import { generateOtp } from '../../../utils/generateCode.js'
import { getOtpExpiry } from '../../../utils/optExpiry.js'
// import { sendSMS } from '../../../utils/sendSMS.js'
import { sendOtpEmail } from '../../../utils/sendOtpMail.js'

const seconds = 30

// =================== PHONE ===================
export async function hasRecentPhoneOtp(phone) {
  const snapshot = await AccessCode.where('phone', '==', phone)
    .where('role', '==', 'manager')
    .where('type', '==', 'sms')
    .where('isUsed', '==', false)
    .get()

  const cutoff = getOtpExpiry(seconds)

  return snapshot.docs.some((doc) => {
    const createdAt = doc.data()?.createdAt
    return createdAt && createdAt.toDate() >= cutoff
  })
}

export async function sendOtpByPhone(phone) {
  const otp = generateOtp()
  const id = uuid()

  await AccessCode.doc(id).set({
    phone,
    otp,
    isUsed: false,
    createdAt: new Date(),
    role: 'manager',
    type: 'sms',
  })

  // sendSMS({ to: phone, text: `Your OTP code is ${otp}` })

  return { otp, id }
}

// =================== EMAIL ===================

export async function hasRecentEmailOtp(email) {
  const snapshot = await AccessCode.where('email', '==', email)
    .where('role', '==', 'employee')
    .where('type', '==', 'email')
    .where('isUsed', '==', false)
    .get()

  const cutoff = getOtpExpiry(seconds)

  return snapshot.docs.some((doc) => {
    const createdAt = doc.data()?.createdAt
    return createdAt && createdAt.toDate() >= cutoff
  })
}

export async function sendOtpByEmail(email) {
  const otp = generateOtp()
  const id = uuid()

  await AccessCode.doc(id).set({
    email,
    otp,
    isUsed: false,
    createdAt: new Date(),
    role: 'employee',
    type: 'email',
  })
  sendOtpEmail({ to: email, otpCode: otp })

  return { otp, id }
}
