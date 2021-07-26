import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Image, ActivityIndicator } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { connect } from 'react-redux'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { File, MessageRaw, MessageStatus } from '../assets/ts/orm'
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
import * as RNFS from 'react-native-fs'
import Video from 'react-native-video'
import { useNavigation } from '@react-navigation/native'
import { PreviewFileType } from '../screens/PreviewFile'

interface Props {
  localUser: LocalUserState
  message: MessageRaw
  onDelete: (messageID: string) => void
}

function ChatBubble(props: Props) {
  const theme = useTheme()
  const isAuthorMe = props.message.author === props.localUser.id
  const menuRef = useRef<Menu>()
  const navigation = useNavigation()

  const [filesb64, setFilesb64] = useState([] as string[])

  useEffect(() => {
    ;(async function() {
      if (props.message.files.length > 0) {
        const out = []
        for (let i = 0; i < props.message.files.length; i++) {
          const file = props.message.files[i]
          try {
            if (file.renderable)
              out.push(await RNFS.readFile(file.uri, 'base64'))
            else out.push(null)
          } catch (error) {
            out.push(null)
          }
        }
        setFilesb64([...filesb64, ...out])
      }
    })()
  }, [])

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

  function showFiles(files: File[]) {
    if (files.length > 0 && filesb64.length > 0) {
      return filesb64.map((b64, i) => {
        if (!props.message.files[i]) return null
        if (b64 !== null) {
          if (props.message.files[i].name.includes('.mp4'))
            return (
              <TouchableOpacity
                activeOpacity={1}
                key={i}
                onPress={() => {
                  if (!menuRef.current.isOpen())
                    navigation.navigate('PreviewFile', {
                      file: Object.assign(props.message.files[i], {
                        b64: b64,
                        parentMessageId: props.message.id,
                      }) as PreviewFileType,
                    })
                }}
              >
                <Video
                  source={{ uri: props.message.files[i].uri }}
                  volume={0}
                  repeat={true}
                  resizeMode="contain"
                  style={{ height: 150, marginVertical: 10 }}
                />
              </TouchableOpacity>
            )
          else
            return (
              <TouchableOpacity
                activeOpacity={1}
                key={i}
                onPress={() => {
                  if (!menuRef.current.isOpen())
                    navigation.navigate('PreviewFile', {
                      file: Object.assign(props.message.files[i], {
                        b64: b64,
                        parentMessageId: props.message.id,
                      }) as PreviewFileType,
                    })
                }}
              >
                <Image
                  style={{
                    height: 150,
                    width: '100%',
                    resizeMode: 'contain',
                    borderRadius: 5,
                    marginVertical: 5,
                  }}
                  source={{
                    uri: `data:${props.message.files[i].mime};base64,${b64}`,
                  }}
                />
              </TouchableOpacity>
            )
        } else
          return (
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                if (!menuRef.current.isOpen())
                  navigation.navigate('PreviewFile', {
                    file: Object.assign(props.message.files[i], {
                      b64: b64,
                      parentMessageId: props.message.id,
                    }) as PreviewFileType,
                  })
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: 10,
                }}
              >
                <Icon name="document" size={50} color={theme.colors.text} />
                <Text
                  style={{ color: theme.colors.text, fontSize: 12 }}
                  numberOfLines={1}
                >
                  {props.message.files[i].name}
                </Text>
              </View>
            </TouchableOpacity>
          )
      })
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
        <View style={{ flex: props.message.files.length > 0 ? 1 : 0 }}>
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
                {showText(props.message.text, props.message.status)}
                <View style={{ marginTop: 10 }}>
                  {showFiles(props.message.files)}
                </View>
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
                  {timeHandler(props.message.timestamp)}
                </Text>
                {isAuthorMe ? statusIcon(props.message.status) : null}
              </View>
            </View>
          </TouchableOpacity>
        </View>
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

          {props.message.status !== MessageStatus.deleted ? (
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
            </View>
          ) : null}

          {isAuthorMe && props.message.status !== MessageStatus.deleted ? (
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
