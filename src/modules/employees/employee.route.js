import { employeeController } from './controllers/index.js'
import express from 'express'

const employeeRouter = express.Router()

employeeRouter.post('/', employeeController.createEmployee)
employeeRouter.get('/', employeeController.getAllEmployee)
employeeRouter.get('/active', employeeController.getActiveEmployee)
employeeRouter.get('/:id', employeeController.getEmployeeById)
employeeRouter.put('/:id', employeeController.updateEmployee)
employeeRouter.delete('/:id', employeeController.removeEmployee)

export default employeeRouter
