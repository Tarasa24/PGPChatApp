/**
 * @format
 */

import { AppRegistry } from 'react-native'
import App from './App'
import { name as appName } from './app.json'

import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification from 'react-native-push-notification'
import OpenPGP from 'react-native-fast-openpgp'
import { fetchRest } from './assets/ts/api'
import { store } from './store/store'

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
  onNotification: function(notification) {
    console.log('NOTIFICATION:', notification)
    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData)
  },

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: true,
  requestPermissions: true,
})

AppRegistry.registerComponent(appName, () => App)
