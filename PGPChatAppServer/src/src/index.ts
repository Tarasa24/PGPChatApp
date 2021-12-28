import express from 'express'

import { createServer } from 'http'
import { Server } from 'socket.io'
import { ExpressPeerServer } from 'peer'

import initSocketIO from './socketIO.js'
import router from './router.js'

import { sequelize } from './models.js'
import initPeerServer from './peerjs.js'

const app = express()
app.use(express.json())

const server = createServer(app)

export const io = new Server(server, {
  path: process.env.NODE_ENV === 'production' ? '/app-api/socket.io' : '/socket.io',
  maxHttpBufferSize: 32 * 1e6,
})
initSocketIO(io)

const peerServer = ExpressPeerServer(server, { path: '/peerjs' })
app.use(process.env.NODE_ENV === 'production' ? '/app-api' : '', peerServer)
initPeerServer(peerServer)

app.use(process.env.NODE_ENV === 'production' ? '/app-api' : '', router)

sequelize.sync().then(() =>
  server.listen(5000, () => {
    console.log('listening on *:5000')
  })
)
