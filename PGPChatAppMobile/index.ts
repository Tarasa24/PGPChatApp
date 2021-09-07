/**
 * @format
 */

// @ts-expect-error
import { name as appName } from './app.json'
import { AppRegistry } from 'react-native'
import App from './App'

import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification from 'react-native-push-notification'
import OpenPGP from 'react-native-fast-openpgp'
import { fetchRest } from './assets/ts/api'
import { store } from './store/store'
import RNCallKeep, { IOptions } from 'react-native-callkeep'

const options = {
  ios: {
    appName: appName,
  },
  android: {
    alertTitle: 'This application needs to access your phone accounts',
    alertDescription:
      "Without granting access you won't be able to recieve in-app calls",
    cancelButton: 'Cancel',
    okButton: 'Grant',
  },
} as IOptions

RNCallKeep.setup(options)

interface IncomingCallPaload {
  caller: string
  callee: string
}

interface NotificationCommands {
  COMMAND: 'DELETE_ALL_NOTIFICATIONS' | 'INCOMING_CALL' | 'DISMISS_CALL'
  PAYLOAD: undefined | IncomingCallPaload
}

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: async function(token) {
    if (store.getState().localUserReducer.id) {
      const nonce = await fetchRest(
        '/keyserver/getNonce/' + store.getState().localUserReducer.id
      )

      await fetchRest('/notifications/registerToken', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: store.getState().localUserReducer.id,
          signature: await OpenPGP.sign(
            await nonce.text(),
            store.getState().localUserReducer.publicKey,
            store.getState().localUserReducer.privateKey,
            ''
          ),
          token: token.token,
        }),
      })
    }
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: async (notification) => {
    if (notification.data['COMMAND'] !== undefined) {
      const data = notification.data as NotificationCommands
      if (notification.data['PAYLOAD'] !== undefined)
        data.PAYLOAD = JSON.parse((data.PAYLOAD as unknown) as string)

      switch (data.COMMAND) {
        case 'DELETE_ALL_NOTIFICATIONS':
          PushNotification.removeAllDeliveredNotifications()
          break
        case 'INCOMING_CALL':
          const res = await fetchRest('/call/' + data.PAYLOAD.callee)

          if (res.status === 200) {
            RNCallKeep.displayIncomingCall(
              data.PAYLOAD.caller,
              data.PAYLOAD.caller,
              data.PAYLOAD.caller,
              'email'
            )
          }
          break
        case 'DISMISS_CALL':
          RNCallKeep.reportEndCallWithUUID(data.PAYLOAD.caller, 1)
          break
      }
    } else notification.finish(PushNotificationIOS.FetchResult.NoData)
  },

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: false,
  requestPermissions: true,
})

RNCallKeep.addEventListener('answerCall', async ({ callUUID: callerID }) => {
  const nonce = await fetchRest(
    '/keyserver/getNonce/' + store.getState().localUserReducer.id
  )
  const res = await fetchRest('/call/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: store.getState().localUserReducer.id,
      signature: await OpenPGP.sign(
        await nonce.text(),
        store.getState().localUserReducer.publicKey,
        store.getState().localUserReducer.privateKey,
        ''
      ),
    }),
  })

  if ([200, 202].includes(res.status)) {
    RNCallKeep.backToForeground()
  }
  RNCallKeep.reportEndCallWithUUID(callerID, 1)
})

RNCallKeep.addEventListener('endCall', async ({ callUUID: callerID }) => {
  const nonce = await fetchRest(
    '/keyserver/getNonce/' + store.getState().localUserReducer.id
  )
  await fetchRest('/call/', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: store.getState().localUserReducer.id,
      signature: await OpenPGP.sign(
        await nonce.text(),
        store.getState().localUserReducer.publicKey,
        store.getState().localUserReducer.privateKey,
        ''
      ),
    }),
  })
})

AppRegistry.registerComponent(appName, () => App)
