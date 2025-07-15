import express from 'express'
import { messageControllers } from './controllers/index.js'
const messageRouter = express.Router()

messageRouter.get('/', messageControllers.getMessages)

export default messageRouter
