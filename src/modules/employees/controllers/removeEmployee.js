import { User } from '../../../config/db.collections.js'

export async function removeEmployee(req, res) {
  try {
    const employeeId = req.params.id

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' })
    }

    const userRef = User.doc(employeeId)
    const docSnap = await userRef.get()

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    await userRef.delete()

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: null,
    })
  } catch (err) {
    console.error('remove-employee error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
