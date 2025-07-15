import { User } from '../../../config/db.collections.js'

export async function getAllEmployee(req, res) {
  try {
    const { page, limit, name, email, phone, role, isActive } = req.query
    let usersRef = User

    if (name) usersRef = usersRef.where('name', '==', name)
    if (email) usersRef = usersRef.where('email', '==', email)
    if (phone) usersRef = usersRef.where('phone', '==', phone)
    if (role) usersRef = usersRef.where('role', '==', role)
    if (isActive) usersRef = usersRef.where('role', '==', isActive)

    const snapshot = await usersRef.get()
    const userList = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())

    const currentPage = parseInt(page) || 1
    const perPage = parseInt(limit) || 5
    const start = (currentPage - 1) * perPage
    const total = userList.length

    const data = userList.slice(start, start + perPage)
    const pagination = {
      total,
      page: currentPage,
      limit: perPage,
      totalPage: Math.ceil(total / perPage),
    }

    res.json({
      success: true,
      message: 'Get all users successfully!',
      data: {
        data,
        pagination,
      },
    })
  } catch (err) {
    console.error('get-all-employee error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
