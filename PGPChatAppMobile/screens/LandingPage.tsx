import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { useTheme } from '../components/ThemeContext'

export default function LandingPage() {
  const theme = useTheme()
  const navigation = useNavigation()

  return (
    <View
      style={{ backgroundColor: theme.colors.background, minHeight: '100%' }}
    >
      <Text style={{ ...styles.headline, color: theme.colors.text }}>
        PGP ChatApp
      </Text>

      <View style={styles.cto}>
        <Button
          color={theme.colors.primary}
          title="Generate account"
          onPress={() => {
            navigation.navigate('GenerateAccount')
          }}
        />
        <Text style={{ marginVertical: 5, textAlign: 'center', color: 'grey' }}>
          or
        </Text>
        <Button
          color={lightenDarkenColor(
            theme.colors.primary,
            80 * (theme.dark ? -1 : 1)
          )}
          title="Import keys"
          onPress={() => {}}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 40,
  },
  cto: { marginHorizontal: 20 },
})
