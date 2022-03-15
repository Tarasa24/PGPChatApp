import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, Text, StyleSheet, Linking, Alert, ToastAndroid } from 'react-native'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { useTheme } from '../components/ThemeContext'
import Logo from '../components/svg/Logo'
import LogoDark from '../components/svg/Logo-dark'
import Waves from '../components/svg/Waves'
import WavesDark from '../components/svg/Waves-dark'
import { Switch, TouchableOpacity } from 'react-native-gesture-handler'
import DocumentPicker from 'react-native-document-picker'
import * as RNFS from 'react-native-fs'
import * as ImportPK from './ImportPK'
import { connect } from 'react-redux'
import Icon from 'react-native-ionicons'

interface Props {
  reduxSetLight: () => void
  reduxSetDark: () => void
}

export function LandingPage(props) {
  const theme = useTheme()
  const navigation = useNavigation()

  function handleDarkMode() {
    theme.dark ? props.reduxSetLight() : props.reduxSetDark()
    theme.toggleScheme()
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, minHeight: '100%' }}>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          zIndex: 2,
        }}>
        <View
          style={{
            alignItems: 'center',
            marginTop: 40,
            marginBottom: 10,
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 25,
              padding: 30,
            }}>
            {!theme.dark ? (
              <Logo style={styles.logo} />
            ) : (
              <LogoDark style={styles.logo} />
            )}
          </View>
        </View>
      </View>
      {!theme.dark ? <Waves style={styles.waves} /> : <WavesDark style={styles.waves} />}

      <View style={styles.cto}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 10,
            borderRadius: 10,
          }}
          onPress={() => {
            navigation.navigate('GenerateAccount')
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 21,
              color: 'white',
            }}>
            Generate New Account
          </Text>
        </TouchableOpacity>
        <Text style={{ marginVertical: 5, textAlign: 'center', color: 'grey' }}>or</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            backgroundColor: lightenDarkenColor(
              theme.colors.primary,
              80 * (theme.dark ? -1 : 1)
            ),
            paddingVertical: 10,
            borderRadius: 10,
          }}
          onPress={async () => {
            const res = await DocumentPicker.pickSingle({
              type: [DocumentPicker.types.plainText],
            })

            const pk = await RNFS.readFile(res.uri, 'utf8')

            const nameMatches = res.name.match(
              new RegExp(/([a-zA-HJ-NP-Z0-9]{27,28})\.asc/)
            )

            if (
              new RegExp(
                /-----BEGIN PGP PRIVATE KEY BLOCK-----(.*)-----END PGP PRIVATE KEY BLOCK-----/s
              ).test(pk)
            )
              navigation.navigate('ImportPK', {
                pk: pk,
                id: nameMatches ? nameMatches[nameMatches.length - 1] : null,
              } as ImportPK.RouteParams)
            else
              Alert.alert(
                'An error has occured',
                "Content isn't in valid PGP Private Key format"
              )
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 21,
              color: 'white',
            }}>
            Import Private Key
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 10,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 17,
            color: theme.colors.text,
          }}>
          Made with ❤️ by{' '}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Linking.openURL('https://tarasa24.dev').catch((err) =>
              console.error("Couldn't load page", err)
            )
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 17,
              color: theme.colors.text,
            }}>
            Tarasa24
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
        }}>
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          activeOpacity={0.7}
          onPress={handleDarkMode}
          onLongPress={() => {
            ToastAndroid.showWithGravity(
              'Toggle theme',
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            )
          }}>
          <Icon
            name={theme.dark ? 'sunny' : 'moon'}
            color={lightenDarkenColor(theme.colors.primary, 80 * (theme.dark ? 0 : 1))}
            size={27.5}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  reduxSetDark: () => dispatch({ type: 'SET_DARK' }),
  reduxSetLight: () => dispatch({ type: 'SET_LIGHT' }),
})

export default connect(null, mapDispatchToProps)(LandingPage)

const styles = StyleSheet.create({
  cto: { marginHorizontal: 30 },
  logo: { transform: [{ scale: 1.25 }] },
  waves: {
    zIndex: 1,
    transform: [{ scale: 0.65 }],
    left: -500,
    top: -85,
    marginBottom: -80,
  },
})
