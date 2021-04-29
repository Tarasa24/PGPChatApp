import React, { useRef, useState } from 'react'
import { View, Text, Platform, NativeModules } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { connect } from 'react-redux'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { Message, MessageRaw, MessageStatus } from '../assets/ts/orm'
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

interface Props {
  localUser: LocalUserState
  message: MessageRaw
  onDelete: (messageID: string) => void
}

function ChatBubble(props: Props) {
  const theme = useTheme()

  const isAuthorMe = props.message.author === props.localUser.id

  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier

  const menuRef = useRef<Menu>()

  function statusIcon(status: MessageStatus) {
    switch (status) {
      case MessageStatus.sending:
        return <Icon name="cloud-upload" size={15} color={theme.colors.text} />
      case MessageStatus.sent:
        return <Icon name="cloud-done" size={15} color={theme.colors.text} />
      case MessageStatus.recieved:
        return (
          <Icon name="radio-button-off" size={15} color={theme.colors.text} />
        )
      case MessageStatus.read:
        return (
          <Icon
            name="checkmark-circle-outline"
            size={15}
            color={theme.colors.text}
          />
        )
    }
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
            <View>
              <Text style={{ color: theme.colors.text }}>
                {props.message.text ? props.message.text : ''}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isAuthorMe ? 'flex-end' : 'flex-start',
                marginTop: 7.5,
              }}
            >
              <Text style={{ color: theme.colors.text, marginRight: 5 }}>
                {new Date(props.message.timestamp).toLocaleTimeString(locale)}
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
