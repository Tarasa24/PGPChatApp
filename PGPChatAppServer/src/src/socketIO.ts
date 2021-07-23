import { Server, Socket } from 'socket.io'
import {
  LoginPayload,
  MessageUpdatePayload,
  SendPayload,
  SocketID,
  SocketUser,
  UserID,
  UserSocket,
} from './types'
import {
  MessagesQueue,
  MessagesQueueType,
  MessageUpdateQueue,
} from './models.js'
import { verifyNonceSignature } from './helperFunctions.js'
import { sendNotification } from './firebase.js'

let userSocketMap: UserSocket = {}
let socketUserMap: SocketUser = {}

function addUser(userID: UserID, socketID: SocketID) {
  userSocketMap[userID] = socketID
  socketUserMap[socketID] = userID
}
function removeUser(socketID: SocketID) {
  const userID: UserID = socketUserMap[socketID]

  delete userSocketMap[userID]
  delete socketUserMap[socketID]
}

/**
 * Throws an error if user isn't logged in.
 * It evaluates if ID of a given socket exists in userSocketMap object.
 * @constructor
 * @param {Socket} socket - The title of the book.
 */
function checkLogin(socket: Socket) {
  if (!socketUserMap[socket.id]) {
    socket.emit('error', 'User not logged in')
    socket.disconnect()
    throw 'User not logged in'
  } else return
}

export default function(io: Server) {
  io.on('connection', (socket: Socket) => {
    // Workaround for users not logging in upon connect or reconnect (I have no idea why it doesn't work)
    socket.emit('requestLogin', {})

    socket.on('login', async (data: LoginPayload) => {
      try {
        if (!data.userID || !data.signature) throw 'Invalid payload'

        // Verify the signature
        if (!await verifyNonceSignature(data.userID, data.signature))
          throw 'Invalid signature'

        // Add user to in-memory dictionary of userIDs and socketIDs (this works only with single instance of server)
        addUser(data.userID, socket.id)

        // Ingest mesage queue for the user
        const messages = await MessagesQueue.findAll({
          where: { to: data.userID },
        })

        for (const message of messages) {
          const msg = message.toJSON() as MessagesQueueType
          io.to(userSocketMap[data.userID]).emit('recieve', {
            id: msg.id,
            timestamp: Number(new Date(msg.timestamp)),
            message: {
              content: msg.message_content,
              signature: msg.message_signature,
            },
            from: msg.from,
            to: msg.to,
          } as SendPayload)
        }

        // Ingest message updates from the queue
        const updates = await MessageUpdateQueue.findAll({
          where: { to: data.userID },
        })

        for (const update of updates) {
          io
            .to(userSocketMap[data.userID])
            .emit('messageUpdate', update.toJSON() as MessageUpdatePayload)
        }
      } catch (error) {
        console.error(error)
        socket.emit('error', error)
        socket.disconnect()
      }
    })

    socket.on('recieveAck', async (messageID: string) => {
      // Remove message from queue upon acknowledgment
      try {
        checkLogin(socket)
        const msg = (await MessagesQueue.findOne({
          where: {
            id: messageID,
            to: socketUserMap[socket.id],
          },
        })) as MessagesQueueType | null

        if (msg) {
          await MessagesQueue.destroy({
            where: {
              id: messageID,
              to: socketUserMap[socket.id],
            },
          })
        }
      } catch (error) {}
    })

    socket.on('send', async (data: SendPayload) => {
      try {
        checkLogin(socket)
        const now = Date.now()

        // Emit payload to socket
        if (userSocketMap[data.to])
          io
            .to(userSocketMap[data.to])
            .emit('recieve', { ...data, timestamp: now } as SendPayload)

        // Add to queue in case the message wasn't recieved
        await MessagesQueue.create({
          id: data.id,
          timestamp: now,
          message_content: data.message.content,
          message_signature: data.message.signature,
          from: data.from,
          to: data.to,
        } as MessagesQueueType)

        // Emit message status back to the sender
        socket.emit('messageUpdate', {
          action: 'SET_STATUS_SENT',
          messageId: data.id,
          to: data.from,
          timestamp: now,
        } as MessageUpdatePayload)

        // Add to queue in case status wasn't recieved
        await MessageUpdateQueue.create({
          action: 'SET_STATUS_SENT',
          messageId: data.id,
          to: data.from,
        } as MessageUpdatePayload)

        //Send notification
        await sendNotification(data.to)
      } catch (error) {
        console.error(error)
      }
    })

    socket.on('messageUpdate', async (data: MessageUpdatePayload) => {
      // Save and hands over the messageUpdate event
      try {
        checkLogin(socket)

        if (userSocketMap[data.to])
          io.to(userSocketMap[data.to]).emit('messageUpdate', {
            action: data.action,
            messageId: data.messageId,
            to: data.to,
            from: socketUserMap[socket.id],
          } as MessageUpdatePayload)

        await MessageUpdateQueue.create({
          action: data.action,
          messageId: data.messageId,
          to: data.to,
          from: socketUserMap[socket.id],
        } as MessageUpdatePayload)
      } catch (error) {
        console.error(error)
      }
    })

    socket.on('messageUpdateAck', async (data: MessageUpdatePayload) => {
      try {
        checkLogin(socket)

        // Remove from queue upon acknowledgment
        await MessageUpdateQueue.destroy({
          where: {
            messageId: data.messageId,
            action: data.action,
            to: socketUserMap[socket.id],
          } as MessageUpdatePayload,
        })
      } catch (error) {
        console.error(error)
      }
    })

    socket.on('disconnect', () => {
      removeUser(socket.id)
    })
  })
}
