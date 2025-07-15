import { Timestamp } from 'firebase-admin/firestore'
import { User } from '../../../config/db.collections.js'

export async function updateMe(req, res, next) {
  try {
    const { id } = req.user
    const { name, email, phone, avatarUrl, avatarPublicId } = req.body

    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userRef = User.doc(id)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const updates = {}

    if (name !== undefined) updates.name = name
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl
    if (avatarPublicId !== undefined) updates.avatarPublicId = avatarPublicId

    updates.updatedAt = Timestamp.now()
    updates.isActive = true

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    await userRef.update(updates)

    const updatedSnap = await userRef.get()
    const updatedUser = { ...updatedSnap.data(), id: updatedSnap.id }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    })
  } catch (err) {
    console.error('UpdateMe error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
