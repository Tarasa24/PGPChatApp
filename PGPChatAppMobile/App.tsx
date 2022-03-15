// Import dependencies
import * as React from 'react'
import { Alert, PermissionsAndroid, View, Linking } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { PersistGate } from 'redux-persist/integration/react'
import { connect, Provider } from 'react-redux'
import { MenuProvider } from 'react-native-popup-menu'
import DeviceInfo from 'react-native-device-info'

// Import screens
import Chats from './screens/Chats'
import Chat from './screens/Chat'
import AddUser from './screens/AddUser'
import Profile from './screens/Profile'
import Header from './components/Header'
import Call from './screens/Call'
import Gallery from './screens/Gallery'
import PreviewFile from './screens/PreviewFile'
import ImportPK from './screens/ImportPK'
import LandingPage from './screens/LandingPage'
import GenerateAccount from './screens/GenerateAccount'
import QRCode from './screens/QRCode'
import QRCodeScanner from './screens/QRCodeScanner'
import ContactSelection from './screens/ContactSelection'

// Import custom
import { ThemeProvider, useTheme } from './components/ThemeContext'
import StackNavigator from './components/StackNavigator'
import { persistor, store } from './store/store'
import * as ORM from './assets/ts/orm'
import { Connection } from 'typeorm'
import * as Socket from './assets/ts/socketio'
import PushNotification from 'react-native-push-notification'
import { navigationRef } from './assets/ts/navigation'
import SplashScreen from 'react-native-splash-screen'

// Globals
global.Buffer = global.Buffer || require('buffer').Buffer

export const Stack = createStackNavigator()

export default function App() {
  const [connected, setConnected] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      store.dispatch({
        type: 'SET_SOCKET_CONNECTING',
        payload: {},
      })
    }, 1)

    // Connect & sync interal db and initialize socket connection
    ORM.connect().then(async (connection: Connection) => {
      await connection.runMigrations()
      await connection.synchronize()
      setConnected(true)

      // Reveal app
      SplashScreen.hide()

      await Socket.connect()

      // Clear recieved notifications
      PushNotification.removeAllDeliveredNotifications()
    })

    // Obtain necessary permissions
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]).then((granted) => {
      if (!granted) {
        Alert.alert(
          'Read and write permissions have not been granted',
          "You won't be able to send or recieve files until granted"
        )
      }
    })
    ;(async () => {
      try {
        const res = await fetch(
          'https://api.github.com/repos/Tarasa24/PGPChatApp/releases',
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
            },
          }
        )

        if (res.status !== 200) return
        const releases = await res.json()
        const v = releases[0].tag_name !== DeviceInfo.getVersion()

        if (v)
          Alert.alert(
            'New version available',
            'Do you wish to be taken to the download page?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                style: 'default',
                onPress: () =>
                  Linking.openURL(releases[0].html_url).catch((err) =>
                    console.error("Couldn't load page", err)
                  ),
              },
            ]
          )
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  function evalConnected() {
    if (!connected) return <View />
    else
      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider>
              <MenuProvider backHandler={true}>
                <ThemedBackground>
                  <NavigationContainer ref={navigationRef}>
                    <StackNavigator Stack={Stack}>
                      <Stack.Screen
                        name="LandingPage"
                        component={LandingPage}
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="GenerateAccount"
                        component={GenerateAccount}
                        options={{
                          header: () => <Header title="Generate Account" />,
                        }}
                      />
                      <Stack.Screen
                        name="ImportPK"
                        component={ImportPK}
                        options={{
                          header: () => <Header title="Import Private Key" />,
                        }}
                      />

                      <Stack.Screen name="Chats" component={Chats} />
                      <Stack.Screen
                        name="AddUser"
                        component={AddUser}
                        options={{
                          header: () => <Header title="Add User" />,
                        }}
                      />
                      <Stack.Screen
                        name="Profile"
                        component={Profile}
                        options={{ header: () => <Header title="Profile" /> }}
                      />
                      <Stack.Screen
                        name="QRCode"
                        component={QRCode}
                        options={{ header: () => <Header title="QR Code" /> }}
                      />
                      <Stack.Screen
                        name="QRCodeScanner"
                        component={QRCodeScanner}
                        options={{ header: () => <Header title="Scanner" /> }}
                      />
                      <Stack.Screen name="Chat" component={Chat} />
                      <Stack.Screen
                        name="Gallery"
                        component={Gallery}
                        options={{ header: () => <Header title="Gallery" /> }}
                      />
                      <Stack.Screen
                        name="PreviewFile"
                        component={PreviewFile}
                        options={{
                          header: () => <Header title="File Preview" />,
                        }}
                      />
                      <Stack.Screen
                        name="Call"
                        component={Call}
                        options={{
                          header: () => <Header title="Call" goBackButton={false} />,
                        }}
                      />
                      <Stack.Screen
                        name="ContactSelection"
                        component={ContactSelection}
                        options={{
                          header: () => <Header title="Share contact(s)" />,
                        }}
                      />
                    </StackNavigator>
                  </NavigationContainer>
                </ThemedBackground>
              </MenuProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      )
  }

  return evalConnected()
}

function ThemedBackground(props) {
  const theme = useTheme()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {props.children}
    </View>
  )
}
