import admin from 'firebase-admin'
import fs from 'fs/promises'
import { Model } from 'sequelize/types'
import { KeyServerEntry, KeyServerEntryType, MessagesQueue } from './models.js'

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(
    await fs.readFile('firebase-secret.json', 'utf-8')
  ) as admin.ServiceAccount),
})

export async function sendNotification(to: string) {
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

  const message = {
    notification: {
      title: 'PGPChatApp',
      body:
        `${numberOfMessages} New Message${numberOfMessages > 1 ? 's' : ''}` +
        (numberOfContacts > 1 ? `from ${numberOfContacts} contacts` : ''),
    },
    token: notificationToken,
  }

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log('Successfully sent message:', response)
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}
