import cors from 'cors'
import helmet from 'helmet'
import express from 'express'
import morgan from 'morgan'
import authRouter from './modules/auth/auth.route.js'
import employeeRouter from './modules/employees/employee.route.js'
import taskRouter from './modules/tasks/task.route.js'
import messageRouter from './modules/messages/message.route.js'

const app = express()

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://task-manager-web-ashy.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ROUTES
app.use('/api/auth', authRouter)
app.use('/api/employees', employeeRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/messages', messageRouter)

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
})

export default app
