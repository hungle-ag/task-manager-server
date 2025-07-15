import { User } from '../../../config/db.collections.js'

export async function getMe(req, res, next) {
  try {
    const userId = req.user?.id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const doc = await User.doc(userId).get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = doc.data()

    return res.status(200).json({
      success: true,
      message: 'Successfully!',
      data: user,
    })
  } catch (err) {
    console.error('get-me error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
