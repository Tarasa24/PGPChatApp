import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native'
import { useTheme } from './ThemeContext'
import { connect } from 'react-redux'
import { LocalUserState } from '../store/reducers/localUserReducer'
import Avatar from './Avatar'
import SocketConnectionStatus from './SocketConnectionStatus'
import * as Profile from '../screens/Profile'
import { getRepository } from 'typeorm'
import { User } from '../assets/ts/orm'
import Logo from '../components/svg/Logo'
import LogoDark from '../components/svg/Logo-dark'

interface Props {
  localUser: LocalUserState
}

function ChatsHeader(props: Props) {
  const navigation = useNavigation()
  const theme = useTheme()

  return (
    <View>
      <View
        style={{
          ...styles.header,
          ...{
            backgroundColor: theme.colors.primary,
          },
        }}
      >
        <View style={{ maxHeight: 20 }}>
          <View style={styles.logo}>{!theme.dark ? <Logo /> : <LogoDark />}</View>
        </View>
        <Text style={styles.title}>PGP ChatApp</Text>
        <TouchableOpacity
          onPress={async () => {
            const userRepository = getRepository(User)
            navigation.navigate('Profile', {
              user: await userRepository.findOneOrFail({
                id: props.localUser.id,
              }),
            } as Profile.RouteParams)
          }}
          activeOpacity={1}
        >
          <Avatar userID={props.localUser.id} size={30} />
        </TouchableOpacity>
      </View>
      <SocketConnectionStatus />
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
})

const mapDispatchToProps = (dispatch: any) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ChatsHeader)

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginTop: Platform.OS == 'ios' ? 20 : 0,
    paddingHorizontal: 10,
    paddingVertical: 15,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    flexGrow: 1,
    fontSize: 21,
    color: 'white',
    marginLeft: -60,
  },
  logo: {
    position: 'relative',
    top: '-50%',
    transform: [{ scale: 0.35 }, { translateX: -100 }, { translateY: -100 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
  },
})
