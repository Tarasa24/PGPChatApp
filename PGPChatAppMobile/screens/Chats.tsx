import { useNavigation } from '@react-navigation/native'
import React, { PureComponent, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  NativeModules,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { connect } from 'react-redux'
import { getRepository, Not } from 'typeorm'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { File, Message, MessageStatus, User } from '../assets/ts/orm'
import Avatar from '../components/Avatar'
import ChatsHeader from '../components/ChatsHeader'
import { useTheme } from '../components/ThemeContext'
import localUserReducer, { LocalUserState } from '../store/reducers/localUserReducer'
import * as Chat from './Chat'
import Time from '../components/Time'
import { socket } from '../assets/ts/socketio'
import { store } from '../store/store'

interface Props {
  localUser: LocalUserState
  messageUpdatesList: string[]
  userNames: Map<string, string>
  blocklist: string[]
}

interface Others {
  user: User
  lastMessage: Message | null
}

class ListItem extends PureComponent<{
  other: Others
  self: User
  navigation: any
  theme: any
  blocklist: string[]
}> {
  render() {
    const { other, self, navigation, theme, blocklist } = this.props
    function highlightNewMessage(msg: Message) {
      function messageText(msg: Message) {
        if (msg.files && msg.files.length > 0) {
          let out =
            msg.files.length === 1
              ? '📎 ' + msg.text
              : msg.files.length + '📎 ' + msg.text
          if (msg.text === '')
            out += msg.files
              .map((f) => {
                return f.name
              })
              .join(' ')

          return out
        } else return msg.text
      }

      if (msg) {
        if (msg.status === MessageStatus.recieved && msg.recipient.id === self.id)
          return (
            <Text
              style={{
                color: theme.colors.text,
              }}
              numberOfLines={1}
            >
              {messageText(msg)}
            </Text>
          )
        else {
          return (
            <Text style={{ color: 'grey' }} numberOfLines={1}>
              {messageText(msg)}
            </Text>
          )
        }
      } else return <Text />
    }

    function statusIcon(lastMessage: Message | null) {
      switch (lastMessage.status) {
        case MessageStatus.sending:
          return <Icon name="cloud-upload" size={15} color="grey" />
        case MessageStatus.sent:
          return <Icon name="cloud-done" size={15} color="grey" />
        case MessageStatus.recieved:
          return <Icon name="radio-button-off" size={15} color="grey" />
        case MessageStatus.read:
          return <Icon name="checkmark-circle-outline" size={15} color="grey" />
      }
    }

    return (
      <TouchableOpacity
        key={other.user.id}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('Chat', {
            participants: { self: self, other: other.user },
          } as Chat.RouteParams)
        }
      >
        <View style={styles.row}>
          <View style={{ paddingHorizontal: 5, position: 'relative' }}>
            <Avatar userID={other.user.id} size={60} />
            {other.lastMessage ? (
              other.lastMessage.status === MessageStatus.recieved &&
              other.lastMessage.recipient.id === self.id ? (
                <View
                  style={{
                    backgroundColor: 'orange',
                    borderRadius: 100,
                    width: 27.5,
                    height: 27.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    right: 0,
                    zIndex: 9,
                  }}
                >
                  <Icon name="alert" color="white" size={20} />
                </View>
              ) : null
            ) : null}
          </View>

          <View style={styles.text}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: theme.colors.text,
                textDecorationLine: blocklist.includes(other.user.id)
                  ? 'line-through'
                  : 'none',
              }}
              numberOfLines={1}
            >
              {other.user.name ? other.user.name : other.user.id}
            </Text>
            {highlightNewMessage(other.lastMessage)}
          </View>
          <View style={styles.status}>
            {other.lastMessage && (
              <Time
                timestamp={other.lastMessage.timestamp}
                style={{ color: theme.colors.text }}
              />
            )}

            {other.lastMessage ? statusIcon(other.lastMessage) : null}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

function Chats(props: Props) {
  const navigation = useNavigation()
  const theme = useTheme()

  enum Stage {
    Loading,
    Loaded,
  }

  interface Users {
    self?: User
    others?: Others[]
  }

  const [stage, setStage] = useState(Stage.Loading)
  const [users, setUsers] = useState({ self: null, others: [] } as Users)

  async function prepareChats() {
    const userRepository = getRepository(User)
    const messageRepository = getRepository(Message)
    const fileRepository = getRepository(File)

    const self = await userRepository.findOneOrFail({
      id: props.localUser.id,
    })

    const allUsers = await userRepository.find({
      where: { id: Not(props.localUser.id) },
    })

    let others = [] as Others[]

    for (const user of allUsers) {
      const lastMessage = await messageRepository.findOne({
        where: [
          {
            recipient: self,
            author: user,
            status: Not(MessageStatus.deleted),
          },
          {
            recipient: user,
            author: self,
            status: Not(MessageStatus.deleted),
          },
        ],
        order: { timestamp: 'DESC' },
      })

      if (lastMessage)
        lastMessage.files = await fileRepository.find({
          where: { parentMessage: lastMessage.id },
          select: ['name'],
        })

      others.push({
        user: user,
        lastMessage: lastMessage ? lastMessage : null,
      })
    }

    others.sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return -1
      else return b.lastMessage.timestamp - a.lastMessage.timestamp
    })
    setUsers({ self: self, others: others })
  }

  useEffect(() => {
    navigation.setOptions({
      header: () => <ChatsHeader />,
    })
  })

  useEffect(() => {
    prepareChats()
      .then(() => setStage(Stage.Loaded))
      .catch(() => setStage(Stage.Loaded))
  }, [props.messageUpdatesList, props.userNames])

  function getChats() {
    if (stage === Stage.Loading) {
      return (
        <View style={{ minHeight: '100%', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )
    } else if (stage === Stage.Loaded) {
      if (users.others.length > 0 && users.self) {
        function generate({ item, index }) {
          return (
            <ListItem
              other={item}
              self={users.self}
              theme={theme}
              navigation={navigation}
              blocklist={props.blocklist}
            />
          )
        }

        return (
          <View>
            <View style={styles.search}>
              <TextInput
                style={{
                  height: 40,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: lightenDarkenColor(
                    theme.colors.background,
                    20 * (theme.dark ? 1 : -1)
                  ),
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingLeft: 12.5,
                }}
                onChangeText={(text) => console.log(text)}
                placeholder="Search"
                placeholderTextColor={lightenDarkenColor(
                  theme.colors.text,
                  150 * (theme.dark ? -1 : 1)
                )}
              />
            </View>
            <FlatList
              data={users.others}
              renderItem={generate}
              keyExtractor={(item) => item.user.id}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  colors={[theme.colors.primary]}
                  progressBackgroundColor={lightenDarkenColor(
                    theme.colors.background,
                    50
                  )}
                  onRefresh={() => {
                    setStage(Stage.Loading)
                    if (socket.connected) socket.disconnect()
                    socket.connect()

                    prepareChats()
                      .then(() => setStage(Stage.Loaded))
                      .catch(() => setStage(Stage.Loaded))
                  }}
                />
              }
            />
          </View>
        )
      } else
        return (
          <View
            style={{
              minHeight: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="search" color={theme.colors.primary} size={60} />
            <Text style={{ color: theme.colors.text }}>
              Time to find someone to talk to
            </Text>
          </View>
        )
    }
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, minHeight: '100%' }}>
      {getChats()}

      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: 10,
        }}
      >
        <TouchableHighlight
          underlayColor={lightenDarkenColor(
            theme.colors.primary,
            30 * (theme.dark ? -1 : 1)
          )}
          onPress={() => navigation.navigate('AddUser', {})}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            width: 65,
            height: 65,
            backgroundColor: theme.colors.primary,
            borderRadius: 100,
          }}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableHighlight>
      </View>
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
  messageUpdatesList: state.messageUpdatesListReducer,
  userNames: state.userNamesReducer,
  blocklist: state.blocklistReducer,
})

const mapDispatchToProps = (dispatch: any) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Chats)

const styles = StyleSheet.create({
  search: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    height: 60,
    alignContent: 'center',
    marginVertical: 5,
  },
  text: {
    paddingVertical: 7.5,
    flex: 1,
    flexGrow: 1,
    paddingLeft: 5,
  },
  status: {
    textAlign: 'right',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 7.5,
  },
})
