import admin from 'firebase-admin'

import serviceAccount from '../firebase-secret.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
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
