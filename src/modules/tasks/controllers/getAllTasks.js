import { Timestamp } from 'firebase-admin/firestore'
import { Task, User } from '../../../config/db.collections.js'

export async function getAllTasks(req, res) {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { page, limit } = req.query
    const currentPage = parseInt(page) || 1
    const perPage = parseInt(limit) || 10

    let query = Task

    if (userRole === 'manager') {
      query = query.where('createdBy', '==', userId)
    } else {
      query = query.where('assignedTo', '==', userId)
    }

    const snapshot = await query.get()

    const allTasks = snapshot.docs
    const sortedTasks = allTasks
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())

    const start = (currentPage - 1) * perPage
    const paginatedTasks = sortedTasks.slice(start, start + perPage)

    // 👉 Gắn employee name nếu có
    const data = await Promise.all(
      paginatedTasks.map(async (task) => {
        let employeeName = null
        if (task.assignedTo) {
          const userSnap = await User.doc(task.assignedTo).get()
          if (userSnap.exists) {
            employeeName = userSnap.data()?.name || null
          }
        }
        return {
          ...task,
          employeeName,
          dueDate: task.dueDate ? task.dueDate.toDate().toISOString() : null,
          createdAt: task.dueDate ? task.createdAt.toDate().toISOString() : null,
          updatedAt: task.dueDate ? task.updatedAt.toDate().toISOString() : null,
        }
      }),
    )

    const pagination = {
      total: sortedTasks.length,
      page: currentPage,
      limit: perPage,
      totalPage: Math.ceil(sortedTasks.length / perPage),
    }

    return res.status(200).json({
      success: true,
      message: 'Get all tasks successfully!',
      data: {
        data,
        pagination,
      },
    })
  } catch (err) {
    console.error('getAllTasks error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
