import express from 'express'

import { createServer } from 'http'
import { Server } from 'socket.io'

import initSocketIO from './socketIO.js'
import router from './router.js'

import { sequelize } from './models.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  path:
    process.env.NODE_ENV === 'production' ? '/app-api/socket.io' : '/socket.io',
})
initSocketIO(io)

app.use(express.json())

app.use(process.env.NODE_ENV === 'production' ? '/app-api' : '', router)

sequelize.sync().then(() =>
  server.listen(5000, () => {
    console.log('listening on *:5000')
  })
)
