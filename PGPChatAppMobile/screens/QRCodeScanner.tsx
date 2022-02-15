import React, { useState } from 'react'
import * as Scanner from 'react-native-qrcode-scanner'
import { RNCamera } from 'react-native-camera'
import { View, Text } from 'react-native'
import { useTheme } from '../components/ThemeContext'
import Icon from 'react-native-ionicons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'

export default function QRCodeScanner() {
  const [scannedID, setScannedID] = useState('')
  const theme = useTheme()
  const navigation = useNavigation()

  return (
    <View style={{ backgroundColor: 'black', minHeight: '100%' }}>
      <Scanner.default
        onRead={(e) => setScannedID(e.data)}
        flashMode={RNCamera.Constants.FlashMode.off}
        showMarker={true}
        markerStyle={{ borderColor: theme.colors.primary }}
        reactivate={true}
        reactivateTimeout={2000}
        topContent={
          <Text style={{ color: 'white', fontSize: 20 }}>
            Aim your camera at the QR code
          </Text>
        }
        bottomContent={
          <View
            style={{
              alignItems: 'center',
              display: scannedID.length !== 0 ? 'flex' : 'none',
              marginTop: 10,
            }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{scannedID}</Text>
            <View
              style={{
                marginTop: 10,
                backgroundColor: theme.colors.primary,
                borderRadius: 50,
              }}>
              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'Chats' },
                      {
                        name: 'AddUser',
                        params: {
                          userID: scannedID,
                        },
                      },
                    ],
                  })
                }}>
                <Icon name="checkmark" color="white" />
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  )
}
