import admin from 'firebase-admin'
import fs from 'fs/promises'
import { Model } from 'sequelize/types'
import { KeyServerEntry, KeyServerEntryType, MessagesQueue } from './models.js'

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(
    await fs.readFile('firebase-secret.json', 'utf-8')
  ) as admin.ServiceAccount),
})

type DismissCallPayload = IncomingCallPayload
interface IncomingCallPayload {
  caller: string
  callee: string
}
export interface NotificationData {
  COMMAND?: 'DELETE_ALL_NOTIFICATIONS' | 'INCOMING_CALL' | 'DISMISS_CALL'
  PAYLOAD: undefined | IncomingCallPayload | DismissCallPayload
}

export async function sendNotification(
  to: string,
  data: NotificationData | null = null
) {
  const userModel = (await KeyServerEntry.findOne({
    where: { id: to },
  })) as Model<any, any>

  const { notificationToken } = userModel.toJSON() as KeyServerEntryType

  const messagesQueue = await MessagesQueue.findAll({
    where: { to: to },
    attributes: ['from'],
  })

  const numberOfMessages = messagesQueue.length
  const numberOfContacts = messagesQueue
    .map((m) => {
      return m['from']
    })
    .filter((value, index, self) => {
      return self.indexOf(value) === index
    }).length

  const message: admin.messaging.Message = {
    notification: {
      title: 'PGP ChatApp',
      body:
        `${numberOfMessages} New Message${numberOfMessages > 1 ? 's' : ''}` +
        (numberOfContacts > 1 ? `from ${numberOfContacts} contacts` : ''),
    },
    android: {
      notification: {
        tag: 'MessageNotification',
      },
    },
    token: notificationToken,
  }

  if (data === null) {
    const removeAllNotificationsCommand: admin.messaging.Message = {
      data: {
        COMMAND: 'DELETE_ALL_NOTIFICATIONS',
      },
      token: notificationToken,
    }
    admin
      .messaging()
      .send(numberOfMessages > 0 ? message : removeAllNotificationsCommand)
      .then((response) => {
        console.log('Successfully sent message:', response)
      })
      .catch((error) => {
        console.log('Error sending message:', error)
      })
  } else {
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'object') data[key] = JSON.stringify(data[key])
    })

    admin
      .messaging()
      .send({
        data: data as any,
        token: notificationToken,
      })
      .then((response) => {
        console.log('Successfully sent message:', response)
      })
      .catch((error) => {
        console.log('Error sending message:', error)
      })
  }
}
