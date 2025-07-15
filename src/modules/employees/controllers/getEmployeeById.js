import { User } from '../../../config/db.collections.js'

export async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params
    const userRef = User.doc(id)
    const doc = await userRef.get()

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        message: `User is not found!`,
      })
      return
    }

    res.json({
      success: true,
      message: 'Get user successfully!',
      data: {
        id: doc.id,
        ...doc.data(),
      },
    })
  } catch (err) {
    console.err('get-employee-by-id error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
