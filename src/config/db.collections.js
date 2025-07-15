import { db } from './db.js'

export const AccessCode = db.collection('accessCodes')
export const User = db.collection('users')
export const Task = db.collection('tasks')
export const Message = db.collection('messages')
