// Import dependencies
import * as React from 'react'
import { Alert, PermissionsAndroid, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { PersistGate } from 'redux-persist/integration/react'
import { connect, Provider } from 'react-redux'
import { AppearanceProvider } from 'react-native-appearance'
import { MenuProvider } from 'react-native-popup-menu'

// Import screens
import Chats from './screens/Chats'
import Chat from './screens/Chat'
import AddUser from './screens/AddUser'
import Profile from './screens/Profile'
import Header from './components/Header'

// Import custom
import { ThemeProvider } from './components/ThemeContext'
import StackNavigator from './components/StackNavigator'
import { persistor, store } from './store/store'
import LandingPage from './screens/LandingPage'
import GenerateAccount from './screens/GenerateAccount'
import * as ORM from './assets/ts/orm'
import { Connection } from 'typeorm'
import * as Socket from './assets/ts/socketio'
import Gallery from './screens/Gallery'
import PreviewFile from './screens/PreviewFile'

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
    Socket.connect()
    ORM.connect().then(async (connection: Connection) => {
      await connection.runMigrations()
      await connection.synchronize()
      setConnected(true)
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
  }, [])

  function evalConnected() {
    if (!connected) return <View />
    else
      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppearanceProvider>
              <ThemeProvider>
                <MenuProvider backHandler={true}>
                  <NavigationContainer>
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

                      <Stack.Screen name="Chats" component={Chats} />
                      <Stack.Screen
                        name="AddUser"
                        component={AddUser}
                        options={{ header: () => <Header title="Add User" /> }}
                      />
                      <Stack.Screen
                        name="Profile"
                        component={Profile}
                        options={{ header: () => <Header title="Profile" /> }}
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
                    </StackNavigator>
                  </NavigationContainer>
                </MenuProvider>
              </ThemeProvider>
            </AppearanceProvider>
          </PersistGate>
        </Provider>
      )
  }

  return evalConnected()
}
