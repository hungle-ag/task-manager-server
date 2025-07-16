import { v4 as uuid } from 'uuid'
import { AccessCode } from '../../../config/db.collections.js'
import { generateOtp } from '../../../utils/generateCode.js'
import { getOtpExpiry } from '../../../utils/optExpiry.js'
import { sendSMS } from '../../../utils/sendSMS.js'
import { sendOtpEmail } from '../../../utils/sendOtpMail.js'
import { OTP_TTL_SECONDS } from '../../../constants/common.js'

// ======= PHONE ========
export async function hasRecentPhoneOtp(phone) {
  try {
    const snapshot = await AccessCode.where('phone', '==', phone)
      .where('role', '==', 'manager')
      .where('type', '==', 'sms')
      .where('isUsed', '==', false)
      .get()

    const cutoffTime = getOtpExpiry(OTP_TTL_SECONDS)

    return snapshot.docs.some((doc) => {
      const createdAt = doc.data()?.createdAt
      return createdAt && createdAt.toDate() >= cutoffTime
    })
  } catch (err) {
    console.error('hasRecentPhoneOtp Error:', err)
    return false
  }
}

export async function sendOtpByPhone(phone) {
  const otp = generateOtp()
  const id = uuid()

  try {
    await AccessCode.doc(id).set({
      phone,
      otp,
      isUsed: false,
      createdAt: new Date(),
      role: 'manager',
      type: 'sms',
    })

    await sendSMS({ to: phone, text: `Your OTP code is ${otp}` })
  } catch (err) {
    console.error('sendOtpByPhone Error:', err)
    throw new Error('Failed to send OTP by phone')
  }

  return { otp, id }
}

// ======= MAIL ========
export async function hasRecentEmailOtp(email) {
  try {
    const snapshot = await AccessCode.where('email', '==', email)
      .where('role', '==', 'employee')
      .where('type', '==', 'email')
      .where('isUsed', '==', false)
      .get()

    const cutoffTime = getOtpExpiry(OTP_TTL_SECONDS)

    return snapshot.docs.some((doc) => {
      const createdAt = doc.data()?.createdAt
      return createdAt && createdAt.toDate() >= cutoffTime
    })
  } catch (err) {
    console.error('hasRecentEmailOtp Error:', err)
    return false
  }
}

export async function sendOtpByEmail(email) {
  const otp = generateOtp()
  const id = uuid()

  try {
    await AccessCode.doc(id).set({
      email,
      otp,
      isUsed: false,
      createdAt: new Date(),
      role: 'employee',
      type: 'email',
    })

    await sendOtpEmail({ to: email, otpCode: otp })
  } catch (err) {
    console.error('sendOtpByEmail Error:', err)
    throw new Error('Failed to send OTP by email')
  }

  return { otp, id }
}
