import express from 'express'
import { taskController } from './controllers/index.js'
import { checkAuth } from '../../middlewares/checkAuth.js'

const taskRouter = express.Router()

taskRouter.get('/', checkAuth, taskController.getAllTasks)
taskRouter.post('/', checkAuth, taskController.createTask)
taskRouter.put('/:id', checkAuth, taskController.updateTask)

export default taskRouter
