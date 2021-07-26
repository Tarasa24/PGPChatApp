import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import Icon from 'react-native-ionicons'
import { useTheme } from './ThemeContext'

interface Props {
  title: String
}

export default function Header({ title }: Props) {
  const navigation = useNavigation()
  const theme = useTheme()

  return (
    <View
      style={{
        ...styles.header,
        ...{
          backgroundColor: theme.colors.primary,
          borderBottomColor: theme.colors.border,
        },
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.icon}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={25} color="white" />
      </TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          flexGrow: 1,
          alignItems: 'center',
          marginLeft: 15,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: 'white',
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    padding: 16.5,
  },
  header: {
    flexDirection: 'row',
    marginTop: Platform.OS == 'ios' ? 20 : 0,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
})
