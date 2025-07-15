export function getOtpExpiry(seconds = 60) {
  return new Date(Date.now() - seconds * 1000)
}
