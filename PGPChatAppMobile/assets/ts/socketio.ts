import OpenPGP from 'react-native-fast-openpgp'
import { io } from 'socket.io-client'
import { getRepository } from 'typeorm'
import DeviceInfo from 'react-native-device-info'
import * as messageUpdatesListReducer from '../../store/reducers/messageUpdatesListReducer'
import * as socketConnectedReducer from '../../store/reducers/socketConnectedReducer'
import { store } from '../../store/store'
import { fetchRest, ping } from './api'
import * as ORM from './orm'

type UserID = string
type LoginPayload = {
  userID: UserID
  signature: string
}

export type Message = {
  content: string
  signature: string
}

export type SendPayload = {
  id: string
  timestamp: number
  message: Message
  from: UserID
  to: UserID
}

export type MessageUpdatePayload = {
  to: UserID
  from: UserID
  messageId: string
  action:
    | 'SET_STATUS_SENT'
    | 'SET_STATUS_RECIEVED'
    | 'SET_STATUS_READ'
    | 'DELETE'
  timestamp?: number
}

// TODO: Add production url
const path = __DEV__
  ? DeviceInfo.isEmulatorSync()
    ? 'ws://10.0.2.2:5000'
    : 'ws://192.168.1.82:5000'
  : 'wss://chatapp.tarasa24.dev/app-api'

const socket = io(path, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  timeout: 1000,
  reconnectionDelayMax: 1000,
})

async function emitUnsentMessages(socket: any) {
  const messageRepository = getRepository(ORM.Message)
  const unsentMessages = await messageRepository.find({
    where: { status: ORM.MessageStatus.sending },
  })

  if (unsentMessages.length > 0) {
    const localUser = store.getState().localUserReducer

    for (const msg of unsentMessages) {
      socket.emit('send', {
        id: msg.id,
        timestamp: msg.timestamp,
        message: {
          content: await OpenPGP.encrypt(msg.text, msg.recipient.publicKey),
          signature: await OpenPGP.sign(
            msg.text,
            localUser.publicKey,
            localUser.privateKey,
            ''
          ),
        },
        from: localUser.id,
        to: msg.recipient.id,
      } as SendPayload)
    }
  }
}

async function login(socket: any) {
  const localuser = store.getState().localUserReducer
  if (!localuser.id) {
    socket.disconnect()
    return
  }

  const res = await fetchRest('/getNonce/' + localuser.id)
  const nonce = await res.text()

  socket.emit('login', {
    userID: localuser.id,
    signature: await OpenPGP.sign(
      nonce,
      localuser.publicKey,
      localuser.privateKey,
      ''
    ),
  } as LoginPayload)

  store.dispatch({
    type: 'SET_SOCKET_CONNECTED',
    payload: {},
  } as socketConnectedReducer.Action)

  await emitUnsentMessages(socket)
}

function connect() {
  store.dispatch({
    type: 'SET_SOCKET_CONNECTING',
    payload: {},
  } as socketConnectedReducer.Action)

  socket.on('connect', async () => {
    await login(socket)
  })

  socket.on('recieve', async (payload: SendPayload) => {
    const messageRepository = getRepository(ORM.Message)
    const userRepository = getRepository(ORM.User)

    // Check if incoming user already exists in the device DB
    if ((await userRepository.count({ id: payload.from })) === 0) {
      try {
        const res = await fetchRest('/keyserver/lookup/' + payload.from, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        const sender = (await res.json()) as ORM.User

        const user = new ORM.User()
        user.id = payload.from
        user.name = sender.name
        user.picture = sender.picture
        user.publicKey = sender.publicKey

        userRepository.insert(user)
      } catch (error) {
        console.error(error)
        return
      }
    }

    const author = await userRepository.findOne(payload.from)

    const msg = new ORM.Message()
    msg.id = payload.id
    msg.timestamp = payload.timestamp
    msg.author = author
    msg.recipient = await userRepository.findOne(
      store.getState().localUserReducer.id
    )
    msg.text = await OpenPGP.decrypt(
      payload.message.content,
      store.getState().localUserReducer.privateKey,
      ''
    )
    msg.status = ORM.MessageStatus.recieved

    // If signature isn't valid, silently drop the message
    if (!OpenPGP.verify(payload.message.signature, msg.text, author.publicKey))
      return

    await messageRepository.save(msg)
    socket.emit('recieveAck', msg.id)
    socket.emit('messageUpdate', {
      to: msg.author.id,
      from: store.getState().localUserReducer.id,
      action: 'SET_STATUS_RECIEVED',
      messageId: msg.id,
    } as MessageUpdatePayload)

    store.dispatch({
      type: 'ADD_TO_MESSAGE_UPDATES_LIST',
      payload: {
        messageID: msg.id,
      },
    } as messageUpdatesListReducer.Action)
  })

  socket.on('messageUpdate', async (payload: MessageUpdatePayload) => {
    if (payload.to !== store.getState().localUserReducer.id) return

    try {
      const messageRepository = await getRepository(ORM.Message)

      switch (payload.action) {
        case 'SET_STATUS_SENT':
          await messageRepository.update(
            { id: payload.messageId },
            { status: ORM.MessageStatus.sent, timestamp: payload.timestamp }
          )
          break
        case 'SET_STATUS_RECIEVED':
          await messageRepository.update(
            { id: payload.messageId },
            { status: ORM.MessageStatus.recieved }
          )
          break
        case 'SET_STATUS_READ':
          await messageRepository.update(
            { id: payload.messageId },
            { status: ORM.MessageStatus.read }
          )
          break
        case 'DELETE':
          await messageRepository.delete({ id: payload.messageId })
          break
      }

      socket.emit('messageUpdateAck', payload)

      store.dispatch({
        type: 'ADD_TO_MESSAGE_UPDATES_LIST',
        payload: {
          messageID: payload.messageId,
        },
      } as messageUpdatesListReducer.Action)
    } catch (error) {
      console.error(error)
    }
  })

  socket.on('reconnect_attempt', () => {
    store.dispatch({
      type: 'SET_SOCKET_CONNECTING',
      payload: {},
    } as socketConnectedReducer.Action)
  })

  socket.on('reconnect', async () => {
    await login(socket)
  })

  socket.on('disconnect', () => {
    ping()
      .then((latency) => {
        store.dispatch({
          type: 'SET_SOCKET_CONNECTING',
          payload: {},
        } as socketConnectedReducer.Action)
      })
      .catch((reason) => {
        store.dispatch({
          type: 'SET_SOCKET_DISCONNECTED',
          payload: {},
        } as socketConnectedReducer.Action)
      })
  })
}

export { socket, connect }
