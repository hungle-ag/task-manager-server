import { Task, User } from '../../../config/db.collections.js'

export async function removeEmployee(req, res) {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ success: false, message: 'Id is required' })
  }

  try {
    const userRef = User.doc(id)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'Employee is not found' })
    }

    const taskSnap = await Task.where('assignedTo', '==', id).limit(1).get()
    if (!taskSnap.empty) {
      return res.status(400).json({
        success: false,
        message: 'Employee has been assigned to a task',
      })
    }

    await userRef.delete()

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: null,
    })
  } catch (err) {
    console.error('removeEmployee error:', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
