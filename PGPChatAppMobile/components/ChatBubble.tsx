import React, { useRef } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { connect } from 'react-redux'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { MessageRaw, MessageStatus } from '../assets/ts/orm'
import { LocalUserState } from '../store/reducers/localUserReducer'
import { useTheme } from './ThemeContext'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu'
import Clipboard from '@react-native-clipboard/clipboard'
import { timeHandler } from '../assets/ts/helperFunctions'

interface Props {
  localUser: LocalUserState
  message: MessageRaw
  onDelete: (messageID: string) => void
}

function ChatBubble(props: Props) {
  const theme = useTheme()
  const isAuthorMe = props.message.author === props.localUser.id
  const menuRef = useRef<Menu>()

  function statusIcon(status: MessageStatus, color = theme.colors.text) {
    switch (status) {
      case MessageStatus.sending:
        return <Icon name="cloud-upload" size={15} color={color} />
      case MessageStatus.sent:
        return <Icon name="cloud-done" size={15} color={color} />
      case MessageStatus.recieved:
        return <Icon name="radio-button-off" size={15} color={color} />
      case MessageStatus.read:
        return <Icon name="checkmark-circle-outline" size={15} color={color} />
      case MessageStatus.deleted:
        return <Icon name="trash" size={15} color={color} />
    }
  }

  function showText(text: string, status: MessageStatus) {
    if (status == MessageStatus.deleted)
      return (
        <Text style={{ color: theme.colors.text, fontStyle: 'italic' }}>
          This message was deleted.
        </Text>
      )
    else if (text)
      return <Text style={{ color: theme.colors.text }}>{text}</Text>
  }

  return (
    <View
      style={{
        marginTop: 5,
        marginHorizontal: 5,
      }}
    >
      <View
        style={{
          flex: 1,
          maxWidth: '75%',
          flexDirection: 'row',
          alignSelf: isAuthorMe ? 'flex-end' : 'flex-start',
          alignItems: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={() => menuRef.current.open()}
        >
          <View
            style={{
              backgroundColor: isAuthorMe
                ? lightenDarkenColor(
                    theme.colors.background,
                    25 * (theme.dark ? 1 : -1)
                  )
                : lightenDarkenColor(
                    theme.colors.primary,
                    55 * (theme.dark ? -1 : 1)
                  ),
              paddingHorizontal: 15,
              paddingVertical: 7,
              borderRadius: 20,
              marginRight: 5,
              flexShrink: 1,
            }}
          >
            <View>{showText(props.message.text, props.message.status)}</View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isAuthorMe ? 'flex-end' : 'flex-start',
                marginTop: 7.5,
              }}
            >
              <Text style={{ color: theme.colors.text, marginRight: 5 }}>
                {timeHandler(props.message.timestamp)}
              </Text>
              {isAuthorMe ? statusIcon(props.message.status) : null}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Menu ref={menuRef} renderer={renderers.SlideInMenu}>
        <MenuTrigger />
        <MenuOptions
          optionsContainerStyle={{
            padding: 5,
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            alignItems: 'center',
          }}
        >
          <MenuOption style={{ marginTop: 7.5 }}>
            <Text
              style={{
                color: 'grey',
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              {new Date(props.message.timestamp).toString()}
            </Text>
          </MenuOption>

          <MenuOption style={{ marginBottom: 7.5 }}>
            <Text
              style={{
                color: 'grey',
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              {MessageStatus[props.message.status].charAt(0).toUpperCase() +
                MessageStatus[props.message.status].slice(1) +
                ' '}
              {statusIcon(props.message.status, 'grey')}
            </Text>
          </MenuOption>

          <View
            style={{
              backgroundColor: theme.colors.border,
              width: 300,
              height: 0.7,
            }}
          />

          <MenuOption
            style={{ marginVertical: 7.5 }}
            onSelect={() => {
              Clipboard.setString(props.message.text)
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              Copy
            </Text>
          </MenuOption>

          {isAuthorMe ? (
            <View>
              <View
                style={{
                  backgroundColor: theme.colors.border,
                  width: 300,
                  height: 0.7,
                }}
              />
              <MenuOption
                style={{ marginVertical: 7.5 }}
                onSelect={() => props.onDelete(props.message.id)}
              >
                <Text
                  style={{
                    color: 'red',
                    fontWeight: 'bold',
                    fontSize: 15,
                    textAlign: 'center',
                  }}
                >
                  Delete
                </Text>
              </MenuOption>
            </View>
          ) : null}
        </MenuOptions>
      </Menu>
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
})

const mapDispatchToProps = (dispatch: any) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ChatBubble)
