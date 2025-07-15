import { User } from '../../../config/db.collections.js'
import { convertTimestampsToISOString } from '../../../utils/convertTimestampsToISOString.js'

export async function getEmployeeById(req, res) {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' })
    }

    const ref = User.doc(id)
    const snap = await ref.get()

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const data = snap.data()
    const user = {
      id: snap.id,
      ...convertTimestampsToISOString(data, ['createdAt', 'updatedAt']),
    }

    return res.status(200).json({
      success: true,
      message: 'Get user successfully',
      data: user,
    })
  } catch (err) {
    console.error('getEmployeeById error:', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
