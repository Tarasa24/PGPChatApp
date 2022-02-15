/**
 * @format
 */

// @ts-expect-error
import { name as appName } from './app.json'
import { AppRegistry, AppState } from 'react-native'
import App from './App'

import PushNotification, { Importance } from 'react-native-push-notification'
import OpenPGP from 'react-native-fast-openpgp'
import { fetchRest } from './assets/ts/api'
import { getCurrentRoute } from './assets/ts/navigation'
import { store } from './store/store'
import RNCallKeep from 'react-native-callkeep'

const options = {
  ios: {
    appName: appName,
  },
  android: {
    alertTitle: 'This application needs to access your phone accounts',
    alertDescription: "Without granting access you won't be able to recieve in-app calls",
    cancelButton: 'Cancel',
    okButton: 'Grant',
  },
}

RNCallKeep.setup(options)

PushNotification.createChannel(
  {
    channelId: 'new-message',
    channelName: 'New messages',
    importance: Importance.HIGH,
  },
  (created) => console.log(`createChannel returned '${created}'`)
)

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: async function (token) {
    if (store.getState().localUserReducer.id) {
      const nonce = await fetchRest(
        '/keyserver/getNonce/' + store.getState().localUserReducer.id
      )

      await fetchRest('/notifications/registerToken', 'PUT', {
        id: store.getState().localUserReducer.id,
        signature: await OpenPGP.sign(
          await nonce.text(),
          store.getState().localUserReducer.publicKey,
          store.getState().localUserReducer.privateKey,
          ''
        ),
        token: token.token,
      })
    }
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: async (notification) => {
    const data = notification.data
    if (notification.data['PAYLOAD'] !== undefined)
      data.PAYLOAD = JSON.parse(data.PAYLOAD)

    switch (data.COMMAND) {
      case 'NEW_MESSAGE':
        // Ignore notification if the user is on blacklist
        if (
          store.getState().blocklistReducer.includes(data.PAYLOAD.recievedNotificationTo)
        )
          return

        if (data.PAYLOAD.id !== null) {
          const nonce = await fetchRest(
            '/keyserver/getNonce/' + store.getState().localUserReducer.id
          )

          await fetchRest('/notifications/ack', 'POST', {
            id: store.getState().localUserReducer.id,
            signature: await OpenPGP.sign(
              await nonce.text(),
              store.getState().localUserReducer.publicKey,
              store.getState().localUserReducer.privateKey,
              ''
            ),
            messageID: data.PAYLOAD.id,
            notificationTo: data.PAYLOAD.recievedNotificationTo,
          })
        }

        let currentRoute
        try {
          currentRoute = getCurrentRoute()
        } catch (error) {
          currentRoute = null
        }

        function messageBuilder(newMessages) {
          const m = Object.values(newMessages).reduce((pre, c) => pre + c.length).length
          const c = Object.keys(newMessages).length
          return (
            (m > 1 ? `${m} new messages` : 'New message') +
            (c > 1 ? `from ${c} contacts` : '')
          )
        }

        if (
          data.PAYLOAD.id === null &&
          Object.keys(data.PAYLOAD.newMessages).length === 0
        )
          PushNotification.removeAllDeliveredNotifications()
        else if (
          AppState.currentState !== 'active' ||
          (currentRoute !== null && currentRoute.name !== 'Chat')
        )
          PushNotification.localNotification({
            channelId: 'new-message',
            id: '0',
            title: 'PGP ChatApp',
            message: messageBuilder(data.PAYLOAD.newMessages),
            smallIcon: 'logo_transparent',
          })
        else if (currentRoute !== null && currentRoute.name === 'Chat') {
          delete data.PAYLOAD.newMessages[currentRoute.params.participants.other.id]
          if (Object.keys(data.PAYLOAD.newMessages).length > 0)
            PushNotification.localNotification({
              channelId: 'new-message',
              id: 0,
              title: 'PGP ChatApp',
              message: messageBuilder(data.PAYLOAD.newMessages),
              smallIcon: 'logo_transparent',
            })
        }
        break
      case 'DELETE_ALL_NOTIFICATIONS':
        PushNotification.removeAllDeliveredNotifications()
        break
      case 'INCOMING_CALL':
        // Ignore notification if the user is on blacklist
        if (store.getState().blocklistReducer.includes(data.PAYLOAD.caller)) return

        const res = await fetchRest('/call/' + data.PAYLOAD.callee)

        if (res.info().status === 200) {
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
  const res = await fetchRest('/call/accept', 'POST', {
    id: store.getState().localUserReducer.id,
    signature: await OpenPGP.sign(
      await nonce.text(),
      store.getState().localUserReducer.publicKey,
      store.getState().localUserReducer.privateKey,
      ''
    ),
  })

  if ([200, 202].includes(res.info().status)) {
    RNCallKeep.backToForeground()
  }
  RNCallKeep.reportEndCallWithUUID(callerID, 1)
})

RNCallKeep.addEventListener('endCall', async ({ callUUID: callerID }) => {
  const nonce = await fetchRest(
    '/keyserver/getNonce/' + store.getState().localUserReducer.id
  )

  const res = await fetchRest('/call/end', 'POST', {
    id: store.getState().localUserReducer.id,
    signature: await OpenPGP.sign(
      await nonce.text(),
      store.getState().localUserReducer.publicKey,
      store.getState().localUserReducer.privateKey,
      ''
    ),
  })
})

AppRegistry.registerComponent(appName, () => App)
