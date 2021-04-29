import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Button } from 'react-native'
import OpenPGP, { KeyPair } from 'react-native-fast-openpgp'
import { useTheme } from '../components/ThemeContext'
import CryptoJS from 'crypto-js'
import bs58 from 'bs58'
import { LocalUserState } from '../store/reducers/localUserReducer'
import { connect } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { fetchRest } from '../assets/ts/api'
import Toast from 'react-native-toast-message'
import * as ORM from '../assets/ts/orm'
import { getRepository } from 'typeorm'
import Icon from 'react-native-ionicons'
import Clipboard from '@react-native-clipboard/clipboard'
import RNRestart from 'react-native-restart'

interface Props {
  localUser: LocalUserState
  reduxSetLocalUser: (payload: LocalUserState) => void
}

export function GenerateAccount(props: Props) {
  const theme = useTheme()
  const navigation = useNavigation()

  async function saveUserToDB(derivedID: string, publicKey: string) {
    const userRepository = getRepository(ORM.User)

    const localUser = new ORM.User()
    localUser.id = derivedID
    localUser.publicKey = publicKey

    await userRepository.save(localUser)
  }

  enum Stage {
    Generating,
    Checking,
    Success,
    Error,
  }

  const [stage, setStage] = useState(Stage.Generating)
  const [localUserScoped, setLocalUserScoped] = useState({} as LocalUserState)
  const [refresh, setRefresh] = useState(0)

  useEffect(
    () => {
      function generateDerivedAdress(publicKey: string) {
        const firstHash = CryptoJS.SHA256(publicKey)
        const secondHash = CryptoJS.RIPEMD160(firstHash).toString()

        return bs58.encode(Buffer.from(secondHash, 'hex'))
      }

      async function generateKeyPair() {
        const keyPair = await OpenPGP.generate({
          keyOptions: {
            cipher: 'aes256',
            hash: 'sha256',
            RSABits: 4096,
            compression: 'zlib',
            compressionLevel: 7,
          },
        })
        return keyPair
      }

      generateKeyPair().then((keyPair) => {
        const derivedID = generateDerivedAdress(keyPair.publicKey)
        setStage(Stage.Checking)

        fetchRest('/keyserver/check/' + derivedID)
          .then((res) => {
            switch (res.status) {
              case 200:
                setStage(Stage.Success)
                Clipboard.setString(derivedID)
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Keypair has been successfully generated',
                  text2: 'Your ChatApp Adress has been copied to the clipboard',
                  visibilityTime: 10000,
                })

                setLocalUserScoped({
                  id: derivedID,
                  privateKey: keyPair.privateKey,
                  publicKey: keyPair.publicKey,
                })
                break
              case 409:
                setStage(Stage.Error)
                Toast.show({
                  type: 'error',
                  position: 'bottom',
                  text1: 'Generated ChatApp Adress is already in use',
                  text2:
                    'Odds of that happening are roughly 1 : 23.7 Octillion\n(you should go bet in a lottery or something)',
                  autoHide: false,
                })
                break
              default:
                setStage(Stage.Error)
                Toast.show({
                  type: 'error',
                  position: 'bottom',
                  text1: 'Server returned code ' + res.status,
                  autoHide: false,
                })
                break
            }
          })
          .catch(() => {
            setStage(Stage.Error)
            Toast.show({
              type: 'error',
              position: 'bottom',
              text1: 'Error connecting to the Keyserver',
              text2: 'Check your internet connection and try again',
              autoHide: false,
            })
          })
      })
    },
    [refresh]
  )

  function loadingDisplayCond() {
    if (stage === Stage.Generating || stage === Stage.Checking)
      return (
        <View>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.text }}>
            {stage === Stage.Generating ? (
              'Generating keys'
            ) : (
              'Connecting to the Keyserver'
            )}
          </Text>
        </View>
      )
    else if (stage === Stage.Success) {
      return (
        <View>
          <Text style={{ color: theme.colors.text }}>
            Your very own ChatApp Adress:
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 21 }}>
            {localUserScoped.id}
          </Text>

          <View style={{ marginTop: 40 }}>
            <Button
              color={theme.colors.primary}
              title="Upload to Key Server & Continue"
              onPress={async () => {
                try {
                  // Send to keyserver
                  const res = await fetchRest('/keyserver/create', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id: localUserScoped.id,
                      publicKey: localUserScoped.publicKey,
                    }),
                  })

                  switch (res.status) {
                    case 201:
                      // All normal
                      break
                    case 400:
                      throw 'KeyServer POST request - invalid syntax'
                    case 403:
                      throw 'KeyServer POST request - Entry already exists'
                    case 409:
                      throw 'Derived ChatApp ID missmatch'
                    case 500:
                      throw await res.json()
                    default:
                      throw 'Unexpected response from the server ' + res.status
                  }

                  // Save to async sotrage as generic user + save to redux
                  await saveUserToDB(
                    localUserScoped.id,
                    localUserScoped.publicKey
                  )
                  props.reduxSetLocalUser(localUserScoped)

                  // Restart app
                  RNRestart.Restart()
                } catch (error) {
                  setStage(Stage.Error)
                  Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: 'Unexpected error',
                    text2: error,
                    autoHide: false,
                  })
                }
              }}
            />
          </View>
        </View>
      )
    } else {
      return (
        <View style={{ alignItems: 'center' }}>
          <Icon name="alert" color={theme.colors.primary} size={60} />
          <Text style={{ color: theme.colors.text }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: 'gray', marginBottom: 15 }}>
            #{refresh + 1}
          </Text>
          <Button
            onPress={() => {
              setRefresh(refresh + 1)
              setStage(Stage.Generating)
            }}
            title="Try again"
            color={theme.colors.primary}
          />
        </View>
      )
    }
  }

  return (
    <View
      style={{
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 9 }} />
      {loadingDisplayCond()}
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
})

const mapDispatchToProps = (dispatch: any) => ({
  reduxSetLocalUser: (payload: LocalUserState) =>
    dispatch({ type: 'SET_LOCAL_USER', payload: payload }),
})

export default connect(mapStateToProps, mapDispatchToProps)(GenerateAccount)
