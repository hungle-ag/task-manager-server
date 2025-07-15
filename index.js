import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import app from './src/app.js'
import { joinRoom } from './src/socket/joinRoom.js'

dotenv.config()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
})
app.set('io', io)

joinRoom(io)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
