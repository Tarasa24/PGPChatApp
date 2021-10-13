import React, { useState } from 'react'
import { useEffect } from 'react'
import { Text, TextInput, View, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useTheme } from '../components/ThemeContext'
import Waves from '../components/svg/Waves'
import WavesDark from '../components/svg/Waves-dark'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { fetchRest } from '../assets/ts/api'
import Toast from 'react-native-toast-message'
import OpenPGP from 'react-native-fast-openpgp'
import { getRepository } from 'typeorm'
import * as ORM from '../assets/ts/orm'
import { LocalUserState } from '../store/reducers/localUserReducer'
import { connect } from 'react-redux'
import RNRestart from 'react-native-restart'

export interface RouteParams {
  pk: string
  id: string
}

interface Props {
  route: {
    params: RouteParams
  }
  reduxSetLocalUser: (payload: LocalUserState) => void
}

export function ImportPK(props: Props) {
  const theme = useTheme()

  async function saveUserToDB(derivedID: string, publicKey: string) {
    const userRepository = getRepository(ORM.User)

    const localUser = new ORM.User()
    localUser.id = derivedID
    localUser.publicKey = publicKey

    await userRepository.save(localUser)
  }

  const [ID, setID] = useState('')
  const [validID, setValidID] = useState(false)

  enum PKValididty {
    Invalid,
    Validiting,
    Valid,
  }
  const [validPK, setValidPK] = useState(PKValididty.Invalid)
  const [pub, setPub] = useState('')

  useEffect(() => {
    if (props.route.params.id) {
      setID(props.route.params.id)
      setValidID(true)
    }
  }, [])

  useEffect(() => {
    setValidID(new RegExp(/^[a-zA-Z0-9]{27}$/).test(ID))
  }, [ID])

  return (
    <View style={{ backgroundColor: theme.colors.background, minHeight: '100%' }}>
      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 9 }} />
      {!theme.dark ? <Waves style={styles.waves} /> : <WavesDark style={styles.waves} />}
      <View style={{ alignItems: 'center', marginHorizontal: 20 }}>
        <TextInput
          style={{
            marginVertical: 10,
            textAlign: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 10,
            width: '100%',
            color: theme.colors.text,
            backgroundColor: theme.dark ? theme.colors.border : 'white',
          }}
          value={ID}
          placeholder="Enter your ChatApp ID"
          onChangeText={(change) => setID(change)}
          placeholderTextColor="gray"
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 10,
          marginHorizontal: 20,
          alignSelf: 'center',
        }}
      >
        <View
          style={{
            alignItems: 'center',
            marginRight: '20%',
          }}
        >
          <Text style={{ color: theme.colors.text }}>PK format:</Text>
          <Text style={{ color: theme.colors.text }}>ID format:</Text>
          <Text style={{ color: theme.colors.text }}>PK and ID validated:</Text>
        </View>
        <View>
          <Text>✅</Text>
          <Text>{validID ? '✅' : '❌'}</Text>
          <Text>
            {validPK === PKValididty.Valid
              ? '✅'
              : validPK === PKValididty.Validiting
              ? '⏳'
              : validPK === PKValididty.Invalid
              ? '❌'
              : null}
          </Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 20 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            marginTop: 20,
            width: '100%',
            paddingVertical: 10,
            backgroundColor:
              validID && validPK !== PKValididty.Validiting
                ? theme.colors.primary
                : lightenDarkenColor(theme.colors.primary, 80 * (theme.dark ? -1 : 1)),
            marginBottom: 20,
          }}
          disabled={!validID || validPK === PKValididty.Validiting}
          onPress={async () => {
            if (validPK !== PKValididty.Valid) {
              setValidPK(PKValididty.Validiting)
              const res1 = await fetchRest('/keyserver/lookup/' + ID)
              switch (res1.status) {
                case 200:
                  const res1Body = await res1.json()
                  setPub(res1Body.publicKey)
                  const nonce = await fetchRest('/keyserver/getNonce/' + ID)
                  const res2 = await fetchRest('/keyserver/validateSignature', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id: ID,
                      signature: await OpenPGP.sign(
                        await nonce.text(),
                        res1Body.publicKey,
                        props.route.params.pk,
                        ''
                      ),
                    }),
                  })

                  switch (res2.status) {
                    case 200:
                      setValidPK(PKValididty.Valid)
                      return
                    default:
                      setValidPK(PKValididty.Invalid)
                      Toast.show({
                        type: 'error',
                        position: 'bottom',
                        text1: 'An error has occured',
                        text2: await res2.text(),
                        autoHide: false,
                      })
                      return
                  }
                case 404:
                  setValidPK(PKValididty.Invalid)
                  Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: "Provided ID doesnt't exist",
                    text2: 'Please your provided ID again',
                  })
                  return
                default:
                  setValidPK(PKValididty.Invalid)
                  Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: 'An error has occured',
                    text2: await res1.text(),
                    autoHide: false,
                  })
              }
            } else {
              // Save to async storage as generic user + save to redux
              await saveUserToDB(ID, pub)
              props.reduxSetLocalUser({
                id: ID,
                publicKey: pub,
                privateKey: props.route.params.pk,
              })

              // Restart app
              RNRestart.Restart()
            }
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            {validPK === PKValididty.Valid ? 'IMPORT' : 'Validate against the Keyserver'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  reduxSetLocalUser: (payload: LocalUserState) =>
    dispatch({ type: 'SET_LOCAL_USER', payload: payload }),
})

export default connect(null, mapDispatchToProps)(ImportPK)

const styles = StyleSheet.create({
  waves: {
    zIndex: 1,
    transform: [{ scale: 0.65 }],
    left: -500,
    top: -85,
    marginBottom: -100,
  },
})
