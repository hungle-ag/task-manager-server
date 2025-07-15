import { User } from '../../../config/db.collections.js'

export async function getActiveEmployee(req, res) {
  try {
    const snapshot = await User.where('isActive', '==', true).get()
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    res.json({
      success: true,
      message: 'Get all users successfully!',
      data: userList,
    })
  } catch (err) {
    console.error('get-all-employee error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
