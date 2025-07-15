export function convertTimestampsToISOString(data, fields = []) {
  const result = { ...data }
  for (const key of fields) {
    const value = data[key]
    if (value?.toDate) {
      result[key] = value.toDate().toISOString()
    }
  }
  return result
}
