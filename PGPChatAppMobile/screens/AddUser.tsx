import { useNavigation } from '@react-navigation/native'
import React, { useRef, useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { connect } from 'react-redux'
import { getRepository } from 'typeorm'
import { fetchRest } from '../assets/ts/api'
import { User } from '../assets/ts/orm'
import { useTheme } from '../components/ThemeContext'
import { LocalUserState } from '../store/reducers/localUserReducer'
import Waves from '../components/svg/Waves'
import WavesDark from '../components/svg/Waves-dark'
import Icon from 'react-native-ionicons'
import { TouchableOpacity } from 'react-native-gesture-handler'

interface Props {
  localUser: LocalUserState
  route: {
    params: {
      userID: string
    }
  }
}

function AddUser(props: Props) {
  const theme = useTheme()
  const navigation = useNavigation()
  const inputRef = useRef<TextInput>()

  const [inputState, setInputState] = useState(props.route.params.userID)

  async function addUser() {
    const id = inputState

    if (!inputRef.current) return
    inputRef.current.clear()
    inputRef.current.blur()

    const userRepository = getRepository(User)

    try {
      if (id === props.localUser.id)
        throw "Well, you don't need to look up yourself, do ya?"

      // Fetch from server
      const res = await fetchRest('/keyserver/lookup/' + id)

      switch (res.info().status) {
        case 200:
          // All normal
          break
        case 400:
          throw 'Invalid syntax'
        case 404:
          throw 'User not found'
        case 500:
          throw await res.json()
        default:
          throw 'Unexpected error'
      }

      const fetchedUser: User = await res.json()

      // Save to local db
      const user = new User()
      user.id = fetchedUser.id
      user.publicKey = fetchedUser.publicKey
      if ((await userRepository.count({ where: { id: fetchedUser.id } })) === 0)
        await userRepository.insert(user)

      // Navigate to the newly created
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Chats' },
          {
            name: 'Chat',
            params: {
              participants: {
                self: await userRepository.findOneOrFail({
                  id: props.localUser.id,
                }),
                other: await userRepository.findOneOrFail({
                  id: user.id,
                }),
              },
            },
          },
        ],
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error looking up a User',
        text2: error,
        autoHide: false,
      })
    }
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, minHeight: '100%' }}>
      {!theme.dark ? <Waves style={styles.waves} /> : <WavesDark style={styles.waves} />}
      <View
        style={{
          marginHorizontal: 20,
          justifyContent: 'center',
        }}>
        <TextInput
          style={styles.input}
          placeholder="PGPChatApp ID"
          ref={inputRef}
          onChangeText={(change) => setInputState(change)}
          value={inputState}
        />
        <Button onPress={() => addUser()} title="Add" color={theme.colors.primary} />

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => navigation.navigate('QRCodeScanner')}>
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Icon name="qr-scanner" color={theme.colors.text} size={60} />
            <Text style={{ color: theme.colors.text }}>Scan QR Code</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 2, bottom: 40 }} />
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
})

const mapDispatchToProps = (dispatch: any) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(AddUser)

const styles = StyleSheet.create({
  input: {
    height: 55,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    marginBottom: 20,
    borderColor: '#dadada',
    borderWidth: 1,
    borderRadius: 15,
  },
  waves: {
    zIndex: 1,
    transform: [{ scale: 0.65 }],
    position: 'relative',
    left: -500,
    top: -85,
  },
})
