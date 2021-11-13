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

interface Props {
  localUser: LocalUserState
}

function AddUser(props: Props) {
  const theme = useTheme()
  const navigation = useNavigation()
  const inputRef = useRef<TextInput>()

  const [inputState, setInputState] = useState('')

  async function addUser() {
    const id = inputState

    if (!inputRef.current) return
    inputRef.current.clear()
    inputRef.current.blur()

    const userRepository = getRepository(User)

    try {
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
        position: 'top',
        text1: 'Error looking up a User',
        text2: error,
        autoHide: false,
      })
    }
  }

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {!theme.dark ? <Waves style={styles.waves} /> : <WavesDark style={styles.waves} />}
      <View
        style={{
          minHeight: '100%',
          marginHorizontal: 20,
          justifyContent: 'center',
        }}
      >
        <TextInput
          style={styles.input}
          placeholder="ChatApp Adress"
          ref={inputRef}
          onChangeText={(change) => setInputState(change)}
        />
        <Button onPress={() => addUser()} title="Add" color={theme.colors.primary} />
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 2 }} />
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
    position: 'absolute',
    left: -500,
    top: -85,
    marginBottom: -80,
  },
})
