import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-ionicons'
import { File, Message, User } from '../assets/ts/orm'
import Avatar from './Avatar'
import { useTheme } from './ThemeContext'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu'
import { getConnection, getRepository } from 'typeorm'
import * as messageUpdatesListReducer from '../store/reducers/messageUpdatesListReducer'
import { connect } from 'react-redux'
import SocketConnectionStatus from './SocketConnectionStatus'

interface Props {
  user: User
  addToMessageUpdateList: (messageId: string | string[]) => void
}

function ChatHeader(props: Props) {
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
            alignItems: 'center',
            marginLeft: 15,
            flex: 1,
          }}
        >
          <Avatar userID={props.user.id} size={35} />
          <Text
            style={{
              fontSize: 20,
              marginHorizontal: 10,
              color: 'white',
              flexShrink: 1,
              flexGrow: 1,
            }}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {props.user.name ? props.user.name : props.user.id}
          </Text>

          <Icon name="call" size={25} color="white" style={styles.icon} />

          <Menu>
            <MenuTrigger>
              <Icon name="menu" size={25} color="white" style={styles.icon} />
            </MenuTrigger>
            <MenuOptions
              optionsContainerStyle={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            >
              <MenuOption onSelect={() => {}}>
                <Text
                  style={{ ...styles.optionText, color: theme.colors.text }}
                >
                  Conversation settings
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => {}}>
                <Text
                  style={{ ...styles.optionText, color: theme.colors.text }}
                >
                  Search
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => {}}>
                <Text
                  style={{ ...styles.optionText, color: theme.colors.text }}
                >
                  Media
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => {}}>
                <Text
                  style={{ ...styles.optionText, color: theme.colors.text }}
                >
                  Mute notifications
                </Text>
              </MenuOption>
              <MenuOption
                onSelect={async () => {
                  let ids = await getConnection()
                    .createQueryBuilder()
                    .select('message.id', 'id')
                    .from(Message, 'message')
                    .where('message.author = :from', { from: props.user.id })
                    .orWhere('message.recipient = :to', { to: props.user.id })
                    .execute()
                  ids = ids.map((id) => {
                    return id.id
                  })

                  await getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(File)
                    .where('parentMessage In(:id)', {
                      id: ids.join(', '),
                    })
                    .execute()

                  await getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(Message)
                    .where('id In(:id)', {
                      id: ids.join(', '),
                    })
                    .execute()

                  const userRepository = getRepository(User)
                  await userRepository.remove(props.user)

                  navigation.goBack()
                  props.addToMessageUpdateList('null')
                }}
              >
                <Text style={{ ...styles.optionText, color: 'red' }}>
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

const mapStateToProps = (state: any) => ({})

const mapDispatchToProps = (dispatch: any) => ({
  addToMessageUpdateList: (messageId: string | string[]) => {
    dispatch({
      type: 'ADD_TO_MESSAGE_UPDATES_LIST',
      payload: { messageID: messageId },
    } as messageUpdatesListReducer.Action)
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatHeader)
