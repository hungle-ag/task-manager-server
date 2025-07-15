import { createEmployee } from './createEmployee.js'
import { getActiveEmployee } from './getActiveEmployee.js'
import { getAllEmployee } from './getAllEmployee.js'
import { getEmployeeById } from './getEmployeeById.js'
import { removeEmployee } from './removeEmployee.js'
import { updateEmployee } from './updateEmployee.js'

export const employeeController = {
  getAllEmployee,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  removeEmployee,
  getActiveEmployee,
}
