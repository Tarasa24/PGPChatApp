import { Server, Socket } from 'socket.io'
import {
  CallPayload,
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
  OngoingCalls,
  OngoingCallsType,
} from './models.js'
import { verifyNonceSignature } from './helperFunctions.js'
import { sendNotification } from './firebase.js'
import Sequelize from 'sequelize'
import chalk from 'chalk'

/**
 * Map storing userID as key and socketID as its value
 * @returns socketID
 */
export let userSocketMap: UserSocket = {}
/**
 * Map storing socketID as key and userID as its value
 * @returns userID
 */
export let socketUserMap: SocketUser = {}

function addUser(userID: UserID, socketID: SocketID) {
  userSocketMap[userID] = socketID
  socketUserMap[socketID] = userID

  console.log(
    `Connection to the user ${chalk.bold.whiteBright(userID)} ${chalk.grey(
      `(${socketID})`
    )} has been ${chalk.bold.green('established')}`
  )
}
function removeUser(socketID: SocketID) {
  const userID: UserID = socketUserMap[socketID]

  delete userSocketMap[userID]
  delete socketUserMap[socketID]

  console.log(
    `Connection to the user ${chalk.bold.whiteBright(userID)} ${chalk.grey(
      `(${socketID})`
    )} has ${chalk.bold.blue('faded')}`
  )
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

export default function (io: Server) {
  io.on('connection', (socket: Socket) => {
    // Workaround for users not logging in upon connect or reconnect (I have no idea why it doesn't work)
    socket.emit('requestLogin', {})

    socket.on('login', async (data: LoginPayload) => {
      try {
        if (!data.userID || !data.signature) throw 'Invalid payload'

        // Verify the signature
        if (!(await verifyNonceSignature(data.userID, data.signature)))
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
          const up = update.toJSON() as MessageUpdatePayload
          up.timestamp = Number(new Date(up.timestamp))
          io.to(userSocketMap[data.userID]).emit('messageUpdate', up)
        }

        // TODO: Ingest ongoing calls
        const call = (await OngoingCalls.findOne({
          where: {
            [Sequelize.Op.or]: [
              { caller: socketUserMap[socket.id] },
              { callee: socketUserMap[socket.id] },
            ],
          },
        })) as OngoingCallsType | null

        if (call !== null) {
          socket.emit('call', {
            caller: call.caller,
            callerPeerToken: call.callerPeerToken,
            callee: call.callee,
            calleePeerToken: call.calleePeerToken,
          } as CallPayload)
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
          io.to(userSocketMap[data.to]).emit('recieve', {
            ...data,
            timestamp: now,
          } as SendPayload)

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
          timestamp: now,
        } as MessageUpdatePayload)

        //Send notification
        await sendNotification(data.to, {
          COMMAND: 'NEW_MESSAGE',
          PAYLOAD: { id: data.id, recievedNotificationTo: data.from },
        })
      } catch (error) {
        console.error(error)
      }
    })

    socket.on('messageUpdate', async (data: MessageUpdatePayload) => {
      // Save and hands over the messageUpdate event
      try {
        checkLogin(socket)

        // Check if the message set to be deleted is still in the queue. If so, it deletes it and sends only the update
        if (data.action === 'DELETE') {
          await MessagesQueue.destroy({
            where: {
              id: data.messageId,
            },
          })
          // Resend notification with updated queue length
          await sendNotification(data.to, {
            COMMAND: 'NEW_MESSAGE',
            PAYLOAD: { id: null },
          })
        }

        const now = Date.now()

        if (userSocketMap[data.to])
          io.to(userSocketMap[data.to]).emit('messageUpdate', {
            action: data.action,
            messageId: data.messageId,
            to: data.to,
            from: socketUserMap[socket.id],
            timestamp: now,
          } as MessageUpdatePayload)

        await MessageUpdateQueue.create({
          action: data.action,
          messageId: data.messageId,
          to: data.to,
          from: socketUserMap[socket.id],
          timestamp: now,
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

    socket.on('call', async (data: CallPayload) => {
      try {
        checkLogin(socket)

        if (![data.caller, data.callee].includes(socketUserMap[socket.id])) return

        await OngoingCalls.create({
          caller: data.caller,
          callerPeerToken: data.callerPeerToken,
          callee: data.callee,
          calleePeerToken: data.calleePeerToken,
        } as OngoingCallsType)
        await sendNotification(data.callee, {
          COMMAND: 'INCOMING_CALL',
          PAYLOAD: { caller: data.caller, callee: data.callee },
        })

        socket.emit('call', {
          caller: data.caller,
          callerPeerToken: data.callerPeerToken,
          callee: data.callee,
          calleePeerToken: data.calleePeerToken,
        } as CallPayload)
      } catch (error) {
        console.error(error)
      }
    })

    socket.on('endCall', async (data: CallPayload) => {
      try {
        checkLogin(socket)

        if (![data.caller, data.callee].includes(socketUserMap[socket.id])) return

        await OngoingCalls.destroy({
          where: { caller: data.caller, callee: data.callee },
        })

        await sendNotification(data.callee, {
          COMMAND: 'DISMISS_CALL',
          PAYLOAD: { caller: data.caller, callee: data.callee },
        })
      } catch (error) {
        console.error(error)
      }
    })

    socket.on('disconnect', async () => {
      if (socketUserMap[socket.id])
        await OngoingCalls.destroy({
          where: {
            [Sequelize.Op.or]: [
              { caller: socketUserMap[socket.id] },
              { callee: socketUserMap[socket.id] },
            ],
          },
        })

      removeUser(socket.id)
    })
  })
}
