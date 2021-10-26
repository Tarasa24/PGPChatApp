import {useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-ionicons'
import {File, Message, User} from '../assets/ts/orm'
import Avatar from './Avatar'
import * as Gallery from '../screens/Gallery'
import {useTheme} from './ThemeContext'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu'
import {getConnection, getRepository} from 'typeorm'
import * as messageUpdatesListReducer from '../store/reducers/messageUpdatesListReducer'
import {connect} from 'react-redux'
import SocketConnectionStatus from './SocketConnectionStatus'
import {store} from '../store/store'
import {CallPayload, socket} from '../assets/ts/socketio'
import uuid from 'react-native-uuid'
import * as Profile from '../screens/Profile'
import * as socketConnectedReducer from '../store/reducers/socketConnectedReducer'
import * as userAvatarsReducer from '../store/reducers/userAvatarsReducer'
import * as userNamesReducer from '../store/reducers/userNamesReducer'

interface Props {
  user: User
  addToMessageUpdateList: (messageId: string | string[]) => void
  userNames: Map<string, string>
  socketConnected: socketConnectedReducer.StateEnum
  userAvatars: Map<string, string>
  dropAvatar: (userID: string) => void
  dropUsername: (userID: string) => void
}

function ChatHeader(props: Props) {
  const navigation = useNavigation()
  const theme = useTheme()

  const [name, setName] = useState(props.user.name)

  useEffect(() => {
    setName(props.userNames[props.user.id])
  }, [props.userNames])

  return (
    <View>
      <View
        style={{
          ...styles.header,
          ...{
            backgroundColor: theme.colors.primary,
          },
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.icon}
          activeOpacity={0.7}>
          <Icon name="arrow-back" size={25} color="white" />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 15,
            flex: 1,
          }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexShrink: 1,
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 30,
            }}
            onPress={() =>
              navigation.navigate('Profile', {
                user: props.user,
              } as Profile.RouteParams)
            }>
            <Avatar userID={props.user.id} size={35} />
            <Text
              style={{
                fontSize: 20,
                marginHorizontal: 10,
                color: 'white',
              }}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {name ? name : props.user.id}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Start a call',
                'This just might be a missclick. Are you sure you wanna start the call? ',
                [
                  {text: 'No', style: 'cancel'},
                  {
                    text: 'Yes',
                    style: 'default',
                    onPress: () =>
                      socket.emit('call', {
                        caller: store.getState().localUserReducer.id,
                        callerPeerToken: uuid.v4().toString(),
                        callee: props.user.id,
                        calleePeerToken: uuid.v4().toString(),
                      } as CallPayload),
                  },
                ],
              )
            }}
            style={styles.icon}
            disabled={
              props.socketConnected !==
              socketConnectedReducer.StateEnum.Connected
            }
            activeOpacity={0.7}>
            <Icon
              name="call"
              size={25}
              color={
                props.socketConnected !==
                socketConnectedReducer.StateEnum.Connected
                  ? 'grey'
                  : 'white'
              }
            />
          </TouchableOpacity>

          <Menu>
            <MenuTrigger>
              <Icon name="menu" size={25} color="white" style={styles.icon} />
            </MenuTrigger>
            <MenuOptions
              optionsContainerStyle={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}>
              <MenuOption
                onSelect={() => {
                  navigation.navigate('Profile', {
                    user: props.user,
                  } as Profile.RouteParams)
                }}>
                <Text style={{...styles.optionText, color: theme.colors.text}}>
                  Conversation settings
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => {}}>
                <Text style={{...styles.optionText, color: theme.colors.text}}>
                  Search
                </Text>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  navigation.navigate('Gallery', {
                    user: props.user,
                  } as Gallery.RouteParams)
                }}>
                <Text style={{...styles.optionText, color: theme.colors.text}}>
                  Media
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => {}}>
                <Text style={{...styles.optionText, color: theme.colors.text}}>
                  Mute notifications
                </Text>
              </MenuOption>
              <MenuOption
                onSelect={() =>
                  Alert.alert(
                    'Are you sure you want to proceed?',
                    'You are about to delte this whole conversation including all the messages and the contact itself.',
                    [
                      {text: 'No', style: 'default'},
                      {
                        text: 'Yes, proceed',
                        style: 'destructive',
                        onPress: async () => {
                          let ids = await getConnection()
                            .createQueryBuilder()
                            .select('message.id', 'id')
                            .from(Message, 'message')
                            .where('message.author = :from', {
                              from: props.user.id,
                            })
                            .orWhere('message.recipient = :to', {
                              to: props.user.id,
                            })
                            .execute()
                          ids = ids.map((id) => {
                            return id.id
                          })

                          await getConnection()
                            .createQueryBuilder()
                            .delete()
                            .from(File)
                            .where(`parentMessageId In('${ids.join("', '")}')`)
                            .orWhere('id = :fileID', {
                              fileID: props.userAvatars[props.user.id],
                            })
                            .execute()

                          props.dropAvatar(props.user.id)

                          await getConnection()
                            .createQueryBuilder()
                            .delete()
                            .from(Message)
                            .where(`id In('${ids.join("', '")}')`)
                            .execute()

                          props.dropUsername(props.user.id)

                          const userRepository = getRepository(User)
                          await userRepository.remove(props.user)

                          navigation.goBack()
                          props.addToMessageUpdateList('null')
                        },
                      },
                    ],
                  )
                }>
                <Text style={{...styles.optionText, color: 'red'}}>
                  Delete conversation
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <SocketConnectionStatus />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginTop: Platform.OS == 'ios' ? 20 : 0,
    borderBottomColor: '#d9d9d9',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  icon: {
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 18,
    padding: 5,
  },
})

const mapStateToProps = (state: any) => ({
  userNames: state.userNamesReducer,
  socketConnected: state.socketConnectedReducer,
  userAvatars: state.userAvatarsReducer,
})

const mapDispatchToProps = (dispatch: any) => ({
  addToMessageUpdateList: (messageId: string | string[]) => {
    dispatch({
      type: 'ADD_TO_MESSAGE_UPDATES_LIST',
      payload: {messageID: messageId},
    } as messageUpdatesListReducer.Action)
  },
  dropAvatar: (userID: string) =>
    dispatch({
      type: 'DROP_USER_AVATAR',
      payload: {userID: userID},
    } as userAvatarsReducer.Action),
  dropUsername: (userID: string) =>
    dispatch({
      type: 'DROP_USER_NAME',
      payload: {userID: userID},
    } as userNamesReducer.Action),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatHeader)
