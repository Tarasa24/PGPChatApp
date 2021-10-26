import OpenPGP from 'react-native-fast-openpgp'
import { io } from 'socket.io-client'
import { getConnection, getRepository } from 'typeorm'
import DeviceInfo from 'react-native-device-info'
import * as messageUpdatesListReducer from '../../store/reducers/messageUpdatesListReducer'
import * as socketConnectedReducer from '../../store/reducers/socketConnectedReducer'
import { store } from '../../store/store'
import { fetchRest, ping } from './api'
import * as ORM from './orm'
import * as RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import * as Call from '../../screens/Call'
import * as navigation from './navigation'

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
  action: 'SET_STATUS_SENT' | 'SET_STATUS_RECIEVED' | 'SET_STATUS_READ' | 'DELETE'
  timestamp?: number
}

export type CallPayload = {
  caller: string
  callerPeerToken: string
  callee: string
  calleePeerToken: string
}

// TODO: Add production url
const path = __DEV__
  ? DeviceInfo.isEmulatorSync()
    ? 'ws://10.0.2.2:5000'
    : 'ws://localhost:5000'
  : 'wss://chatapp.tarasa24.dev'

const socket = io(path, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  timeout: 1000,
  reconnectionDelayMax: 1000,
  path: __DEV__ ? '/socket.io' : '/app-api/socket.io',
  forceNew: true,
  multiplex: false,
})

async function emitUnsentMessages(socket: any) {
  const messageRepository = getRepository(ORM.Message)
  const fileRepository = getRepository(ORM.File)
  const unsentMessages = await messageRepository.find({
    where: { status: ORM.MessageStatus.sending },
  })

  if (unsentMessages.length > 0) {
    const localUser = store.getState().localUserReducer

    for (const msg of unsentMessages) {
      const files = await fileRepository.find({ where: { parentMessage: msg } })

      const filesBase64 = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        filesBase64.push(await RNFS.readFile(file.uri, 'base64'))
      }

      const payload = JSON.stringify({
        text: msg.text,
        files: files.map((file, i) => {
          return {
            linkUri: file.linkUri,
            base64: !file.linkUri ? filesBase64[i] : null,
            name: file.name,
            mime: file.mime,
            renderable: file.renderable,
          }
        }),
      } as ORM.sendMessageContent)

      socket.emit('send', {
        id: msg.id,
        timestamp: msg.timestamp,
        message: {
          content: await OpenPGP.encrypt(payload, msg.recipient.publicKey),
          signature: await OpenPGP.sign(
            payload,
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
  store.dispatch({
    type: 'SET_SOCKET_CONNECTING',
    payload: {},
  } as socketConnectedReducer.Action)

  const localuser = store.getState().localUserReducer
  if (!localuser.id) {
    socket.disconnect()
    return
  }

  const res = await fetchRest('/getNonce/' + localuser.id)
  const nonce = await res.text()

  socket.emit('login', {
    userID: localuser.id,
    signature: await OpenPGP.sign(nonce, localuser.publicKey, localuser.privateKey, ''),
  } as LoginPayload)

  store.dispatch({
    type: 'SET_SOCKET_CONNECTED',
    payload: {},
  } as socketConnectedReducer.Action)

  await emitUnsentMessages(socket)
}

async function connect() {
  socket.on('connect', () => {
    login(socket)
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
    msg.timestamp = Number(new Date(payload.timestamp))
    msg.author = author
    msg.recipient = await userRepository.findOne(store.getState().localUserReducer.id)

    const recievePayload: ORM.sendMessageContent = JSON.parse(
      await OpenPGP.decrypt(
        payload.message.content,
        store.getState().localUserReducer.privateKey,
        ''
      )
    )

    msg.text = recievePayload.text
    msg.status = ORM.MessageStatus.recieved

    // If signature isn't valid, silently drop the message
    if (
      !OpenPGP.verify(
        payload.message.signature,
        JSON.stringify(recievePayload),
        author.publicKey
      )
    )
      return

    // Save message and if present also files
    await messageRepository.save(msg)

    if (recievePayload.files.length > 0) {
      for (let i = 0; i < recievePayload.files.length; i++) {
        const file = recievePayload.files[i]
        let uri = `${RNFS.ExternalStorageDirectoryPath}/PGPChatApp/${Date.now()}-${
          file.name
        }`

        await RNFS.mkdir(RNFS.ExternalStorageDirectoryPath + '/PGPChatApp')
        const newFile = new ORM.File()

        // Save file
        if (file.linkUri)
          await RNFetchBlob.config({
            path: uri,
          }).fetch('GET', file.linkUri, {})
        else await RNFS.writeFile(uri, file.base64, 'base64')

        // Calculate hash
        const fileHash = await RNFetchBlob.fs.hash(uri, 'sha256')

        // Check if a file with the same hash exists
        const fileRepository = getRepository(ORM.File)
        const hashedFiles = await fileRepository.find({ where: { hash: fileHash } })

        // If it does, unlink the new file and use previous uri
        if (hashedFiles.length >= 1) {
          RNFetchBlob.fs.unlink(uri)
          uri = hashedFiles[0].uri
        } else newFile.hash = fileHash

        // Save db entry
        newFile.linkUri = file.linkUri
        newFile.mime = file.mime
        newFile.hash = hashedFiles.length >= 1 ? null : fileHash
        newFile.uri = uri
        newFile.name = file.name
        newFile.renderable = file.renderable
        newFile.parentMessage = msg

        fileRepository.insert(newFile)
      }
    }

    // Send acknowledgement of recieving and clean-up
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
      const userRepository = await getRepository(ORM.User)
      const fileRepository = await getRepository(ORM.File)

      switch (payload.action) {
        case 'SET_STATUS_SENT':
          await getConnection()
            .createQueryBuilder()
            .update(ORM.Message)
            .set({
              status: ORM.MessageStatus.sent,
              timestamp: Number(new Date(payload.timestamp)),
            })
            .where('id = :id', { id: payload.messageId })
            .andWhere('status != :status', {
              status: ORM.MessageStatus.deleted,
            })
            .execute()

          break
        case 'SET_STATUS_RECIEVED':
          await getConnection()
            .createQueryBuilder()
            .update(ORM.Message)
            .set({
              status: ORM.MessageStatus.recieved,
            })
            .where('id = :id', { id: payload.messageId })
            .andWhere('status != :status', {
              status: ORM.MessageStatus.deleted,
            })
            .execute()
          break
        case 'SET_STATUS_READ':
          await getConnection()
            .createQueryBuilder()
            .update(ORM.Message)
            .set({
              status: ORM.MessageStatus.read,
            })
            .where('id = :id', { id: payload.messageId })
            .andWhere('status != :status', {
              status: ORM.MessageStatus.deleted,
            })
            .execute()
          break
        case 'DELETE':
          const message = new ORM.Message()
          message.id = payload.messageId
          message.recipient = await userRepository.findOne({ id: payload.to })
          message.author = await userRepository.findOne({ id: payload.from })
          message.text = ''
          message.timestamp = payload.timestamp
          message.status = ORM.MessageStatus.deleted

          await messageRepository.save(message)

          await fileRepository.delete({
            parentMessage: await messageRepository.findOne({
              id: payload.messageId,
            }),
          })
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

  socket.on('call', async (payload: CallPayload) => {
    if (
      [payload.caller, payload.callee].includes(store.getState().localUserReducer.id) &&
      navigation.getCurrentRoute().name !== 'Call'
    )
      navigation.navigate('Call', {
        caller: payload.caller,
        callerPeerToken: payload.callerPeerToken,
        callee: payload.callee,
        calleePeerToken: payload.calleePeerToken,
      } as Call.RouteParams)
  })

  socket.on('endCall', async (payload: CallPayload & { reason: string }) => {
    if (navigation.getCurrentRoute().name === 'Call') navigation.goBack()
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

        setTimeout(() => {
          if (
            store.getState().socketConnectedReducer ==
            socketConnectedReducer.StateEnum.Disconnected
          )
            store.dispatch({
              type: 'SET_SOCKET_CONNECTING',
              payload: {},
            } as socketConnectedReducer.Action)
        }, 2000)
      })
  })

  // I have no idea why do I have invoke this manually. But it is what fixed having socket.connect() inside async callback in App.tsx
  await login(socket)
}

export { socket, connect }
