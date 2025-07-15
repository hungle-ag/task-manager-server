import { User } from '../../../config/db.collections.js'
import { convertTimestampsToISOString } from '../../../utils/convertTimestampsToISOString.js'

export async function getAllEmployee(req, res) {
  try {
    const { page, limit, name, email, phone, role, isActive } = req.query
    let query = User

    if (name) query = query.where('name', '==', name)
    if (email) query = query.where('email', '==', email)
    if (phone) query = query.where('phone', '==', phone)
    if (role) query = query.where('role', '==', role)
    if (isActive !== undefined) query = query.where('isActive', '==', isActive)

    const snap = await query.get()
    const docs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Convert user timestamps and sort by createdAt (-_-)
    const userList = docs
      .map((item) => convertTimestampsToISOString(item, ['createdAt', 'updatedAt', 'dob']))
      .sort((a, b) => {
        const before = new Date(a.createdAt || 0).getTime()
        const after = new Date(b.createdAt || 0).getTime()
        return after - before
      })

    const currentPage = parseInt(page) || 1
    const perPage = parseInt(limit) || 5
    const start = (currentPage - 1) * perPage
    const total = userList.length
    const totalPage = Math.ceil(total / perPage)
    const end = start + perPage

    const data = userList.slice(start, end)
    const pagination = {
      total,
      page: currentPage,
      limit: perPage,
      totalPage,
    }

    return res.status(200).json({
      success: true,
      message: 'Get all users successfully',
      data: { data, pagination },
    })
  } catch (err) {
    console.error('getAllEmployee error:', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
