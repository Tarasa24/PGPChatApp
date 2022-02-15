import React from 'react'
import { View, Text, Dimensions, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useTheme } from '../components/ThemeContext'
import * as QR from 'react-native-qrcode-svg'
import Icon from 'react-native-ionicons'
import Toast from 'react-native-toast-message'
import Clipboard from '@react-native-clipboard/clipboard'
import Waves from '../components/svg/Waves'
import WavesDark from '../components/svg/Waves-dark'

interface Props {
  route: {
    params: {
      userID: string
    }
  }
}

export default function QRCode(props: Props) {
  const theme = useTheme()

  function QRWidth() {
    const w = Dimensions.get('window').width
    const h = Dimensions.get('window').height

    return Math.min(w, h) * 0.6
  }

  return (
    <View style={{ minHeight: '100%', backgroundColor: theme.colors.background }}>
      {!theme.dark ? <Waves style={styles.waves} /> : <WavesDark style={styles.waves} />}
      <View
        style={{
          alignItems: 'center',
          marginVertical: 20,
        }}>
        <View
          style={{
            borderColor: theme.colors.border,
            borderWidth: 2,
            borderRadius: 20,
            padding: 15,
            backgroundColor: 'white',
          }}>
          <QR.default
            value={props.route.params.userID}
            logo={
              theme.dark
                ? require('../assets/img/logo-dark64.png')
                : require('../assets/img/logo-light64.png')
            }
            logoSize={QRWidth() / 4}
            size={QRWidth()}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => {
          Toast.show({
            type: 'info',
            position: 'bottom',
            text1: 'PGPChatApp ID has been copied',
            visibilityTime: 1500,
          })
          Clipboard.setString(props.route.params.userID)
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
            {props.route.params.userID}
          </Text>
          <Icon
            name="copy"
            size={21}
            color={theme.colors.text}
            style={{ marginLeft: 7.5 }}
          />
        </View>
      </TouchableOpacity>

      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 2, bottom: 40 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  waves: {
    zIndex: 1,
    transform: [{ scale: 0.65 }],
    position: 'relative',
    left: -500,
    top: -85,
    marginBottom: -80,
  },
})
