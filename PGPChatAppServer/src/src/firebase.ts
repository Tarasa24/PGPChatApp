import admin from 'firebase-admin'
import fs from 'fs/promises'

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(
    await fs.readFile('firebase-secret.json', 'utf-8')
  ) as admin.ServiceAccount),
})

var message = {
  notification: {
    title: 'PGP ChatApp - Server status update',
    body: 'Servers are up',
  },
  token:
    'fcmSsR5bQ4m1iHyx3X33Je:APA91bEp5mmvAwe-skRdGK_-Zuu49zkD99i-ToySxVobeYMAq9buNlmrZY2_CznMRQ7IMqcfev2JXMqlEjVPCST01JDWm73PgoppFMGIny4bQcpbMePXAWfR8qOSkHCYShZC6gPA5G1Q',
}

export function sendStatusMessage() {
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
