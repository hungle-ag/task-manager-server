import { User } from '../../../config/db.collections.js'

export async function getActiveEmployee(req, res) {
  try {
    const snapshot = await User.where('isActive', '==', true).get()

    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return res.status(200).json({
      success: true,
      message: 'Get active employees successfully!',
      data: userList,
    })
  } catch (err) {
    console.error('getActiveEmployee error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
