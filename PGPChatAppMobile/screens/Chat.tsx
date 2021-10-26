import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Text,
  Platform,
  NativeModules,
  BackHandler,
  StyleSheet,
  Image,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import {
  File,
  Message,
  MessageRaw,
  MessageStatus,
  sendMessageContent,
  User,
} from '../assets/ts/orm'
import ChatHeader from '../components/ChatHeader'
import { useTheme } from '../components/ThemeContext'
import ChatBubble from '../components/ChatBubble'
import { getRepository } from 'typeorm'
import { LocalUserState } from '../store/reducers/localUserReducer'
import { connect } from 'react-redux'
import { socket, SendPayload, MessageUpdatePayload } from '../assets/ts/socketio'
import OpenPGP from 'react-native-fast-openpgp'
import * as messageUpdatesListReducer from '../store/reducers/messageUpdatesListReducer'
import * as RNFS from 'react-native-fs'
import DocumentPicker, { MimeType } from 'react-native-document-picker'
import Video from 'react-native-video'
import RNFetchBlob from 'rn-fetch-blob'
import * as pickedGifReducer from '../store/reducers/pickedGifReducer'

export interface RouteParams {
  participants: {
    self: User
    other: User
  }
}

interface Props {
  route: {
    params: RouteParams
  }
  localUser: LocalUserState
  messageUpdatesList: string[]
  addToMessageUpdateList: (messageId: string | string[]) => void
  pickedGif: InlineFile
  dropPickedGif: () => void
}

export interface InlineFile {
  renderable: boolean
  mime: MimeType
  b64: string
  linkUri?: string
  uri: string
  name: string
}

function Chat(props: Props) {
  const navigation = useNavigation()
  const theme = useTheme()
  const inputRef = useRef<TextInput>()
  const [scrollViewRef, setScrollViewRef]: [
    ScrollView,
    (ref: ScrollView) => void
  ] = useState(null)

  enum Stages {
    Loading,
    Loaded,
  }

  const [stage, setStage] = useState(Stages.Loading)
  const [messages, setMessages] = useState([] as MessageRaw[])
  const [inputState, setInputState] = useState('')

  const [addFileMenuOpened, setAddFileMenuOpened] = useState(false)

  useEffect(() => {
    if (Object.keys(props.pickedGif).length != 0) {
      setInlineFiles([...inlineFiles, props.pickedGif])
      props.dropPickedGif()
    }
  }, [props.pickedGif])

  function shouldScrollDown() {
    if (scrollViewRef) return true
    else return false
  }

  async function loadMessages() {
    const messageRepository = getRepository(Message)

    const messages = await messageRepository
      .createQueryBuilder()
      .where(
        `(message.recipientId = '${props.route.params.participants.self.id}' AND message.authorId = '${props.route.params.participants.other.id}')`
      )
      .orWhere(
        `(message.recipientId = '${props.route.params.participants.other.id}' AND message.authorId = '${props.route.params.participants.self.id}')`
      )
      .select(['id', 'timestamp', 'text', 'authorId AS author', 'status'])
      .orderBy('timestamp', 'DESC')
      .getRawMany()

    const fileRepository = getRepository(File)
    for (let i = 0; i < messages.length; i++) {
      messages[i].files = await fileRepository.find({
        where: { parentMessage: messages[i] },
      })
    }

    setMessages(messages)
    setStage(Stages.Loaded)
  }

  async function sendReadStatus() {
    const messageRepository = getRepository(Message)

    const unread = await messageRepository.find({
      where: [
        {
          recipient: props.route.params.participants.self,
          author: props.route.params.participants.other,
          status: MessageStatus.recieved,
        },
      ],
    })

    for (const message of unread) {
      socket.emit('messageUpdate', {
        action: 'SET_STATUS_READ',
        messageId: message.id,
        to: props.route.params.participants.other.id,
      } as MessageUpdatePayload)

      await messageRepository.update({ id: message.id }, { status: MessageStatus.read })
    }

    if (unread.length > 0) props.addToMessageUpdateList(unread.map((msg) => msg.id))
  }

  useEffect(() => {
    navigation.setOptions({
      header: () => <ChatHeader user={props.route.params.participants.other} />,
    })
  }, [])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setAddFileMenuOpened(false)
      if (shouldScrollDown()) scrollViewRef.scrollToEnd({ animated: false })
    })
    return () => {
      keyboardDidShowListener.remove()
    }
  }, [scrollViewRef])

  useEffect(() => {
    loadMessages().then(() => {
      sendReadStatus()
    })
  }, [props.messageUpdatesList])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', function () {
      if (addFileMenuOpened) {
        setAddFileMenuOpened(false)
        return true
      } else {
        navigation.goBack()
        return true
      }
    })

    return () => backHandler.remove()
  }, [addFileMenuOpened])

  async function sendMessage() {
    if (!inputRef.current) return
    const text = inputState
    setInputState('')
    inputRef.current.clear()
    inputRef.current.blur()

    const messageRepository = getRepository(Message)

    const messageDraft = new Message()
    messageDraft.author = props.route.params.participants.self
    messageDraft.recipient = props.route.params.participants.other
    messageDraft.timestamp = Date.now()
    messageDraft.text = text.trim()

    const message = await messageRepository.save(messageDraft)

    if (inlineFiles.length > 0) {
      const fileRepository = getRepository(File)

      for (let i = 0; i < inlineFiles.length; i++) {
        const inlineFile = inlineFiles[i]

        const newFile = new File()
        const base64 =
          inlineFile.b64 !== null
            ? inlineFile.b64
            : await RNFS.readFile(inlineFile.uri, 'base64')
        let uri = `${RNFS.ExternalStorageDirectoryPath}/PGPChatApp/${Date.now()}-${
          inlineFile.name
        }`

        // Save file
        await RNFS.mkdir(RNFS.ExternalStorageDirectoryPath + '/PGPChatApp')
        await RNFS.writeFile(uri, base64, 'base64')

        // Caluclate hash
        const hash = await RNFetchBlob.fs.hash(uri, 'sha256')

        // Check if the file already exists
        const hashedFiles = await fileRepository.find({
          where: { hash: hash },
        })

        // Unlink if it does, and replace the new uri with the one that already exists
        if (hashedFiles.length >= 1) {
          await RNFS.unlink(uri)
          uri = hashedFiles[0].uri
        } else newFile.hash = hash

        newFile.uri = uri
        newFile.mime = inlineFile.mime
        newFile.parentMessage = message
        newFile.name = inlineFile.name
        newFile.renderable = inlineFile.b64 !== null

        await fileRepository.save(newFile)

        inlineFiles[i].b64 = base64
        inlineFiles[i].renderable = newFile.renderable
      }

      setInlineFiles([])
    }

    const payload = JSON.stringify({
      text: message.text,
      files: inlineFiles.map((file) => {
        return {
          linkUri: file.linkUri,
          base64: !file.linkUri ? file.b64 : null,
          name: file.name,
          mime: file.mime,
          renderable: file.renderable,
        }
      }),
    } as sendMessageContent)

    socket.emit('send', {
      id: message.id,
      timestamp: message.timestamp,
      message: {
        content: await OpenPGP.encrypt(
          payload,
          props.route.params.participants.other.publicKey
        ),
        signature: await OpenPGP.sign(
          payload,
          props.localUser.publicKey,
          props.localUser.privateKey,
          ''
        ),
      },
      from: props.route.params.participants.self.id,
      to: props.route.params.participants.other.id,
    } as SendPayload)

    props.addToMessageUpdateList(message.id)
  }

  function sendAddButton(forceAdd = false) {
    if ((inputState || inlineFiles.length > 0) && !forceAdd)
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 7.5,
            paddingVertical: 5,
            borderRadius: 100,
            backgroundColor: theme.colors.primary,
            marginLeft: 5,
          }}
          onPress={() => {
            sendMessage()
          }}
        >
          <Icon color="white" name="send" />
        </TouchableOpacity>
      )
    else
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 100,
            backgroundColor: theme.colors.primary,
            marginLeft: 5,
          }}
          onPress={() => {
            Keyboard.dismiss()
            setAddFileMenuOpened(!addFileMenuOpened)
          }}
        >
          <Icon color="white" name="add" />
        </TouchableOpacity>
      )
  }

  function chatBubbles() {
    function generateArray(messages: MessageRaw[]) {
      const locale =
        Platform.OS === 'ios'
          ? NativeModules.SettingsManager.settings.AppleLocale
          : NativeModules.I18nManager.localeIdentifier

      const out = []
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i]

        out.push(
          <ChatBubble
            message={m as any}
            key={m.id}
            onDelete={async (messageID) => {
              const messageRepository = getRepository(Message)
              await messageRepository.update(
                { id: messageID },
                { status: MessageStatus.deleted, text: '' }
              )

              const fileRepository = getRepository(File)
              await fileRepository.delete({
                parentMessage: await messageRepository.findOne(messageID),
              })

              socket.emit('messageUpdate', {
                action: 'DELETE',
                messageId: messageID,
                to: props.route.params.participants.other.id,
              } as MessageUpdatePayload & { to: string })

              props.addToMessageUpdateList(messageID)
            }}
          />
        )

        if (
          i + 1 !== messages.length &&
          new Date(messages[i].timestamp).toDateString() !==
            new Date(messages[i + 1].timestamp).toDateString()
        ) {
          out.push(
            <Text style={{ textAlign: 'center', color: 'gray', marginTop: 5 }} key={i}>
              {new Date(messages[i + 1].timestamp).toLocaleDateString(locale)}
            </Text>
          )
        }
      }

      return out
    }

    if (stage === Stages.Loading)
      return (
        <View style={{ flexGrow: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )
    else
      return (
        <ScrollView
          ref={(ref) => {
            setScrollViewRef(ref)
          }}
          onContentSizeChange={() => {
            if (shouldScrollDown()) scrollViewRef.scrollToEnd({ animated: false })
          }}
        >
          <View
            style={{
              flexGrow: 1,
              flexDirection: 'column-reverse',
              paddingBottom: 5,
            }}
          >
            {generateArray(messages)}
          </View>
        </ScrollView>
      )
  }

  const [inlineFiles, setInlineFiles] = useState([] as InlineFile[])

  useEffect(() => {
    if (shouldScrollDown()) scrollViewRef.scrollToEnd({ animated: false })
  }, [inlineFiles, addFileMenuOpened])

  function showInlineFiles() {
    function evalFile(file: InlineFile) {
      if (file.b64 === null)
        return (
          <View
            style={{
              height: 64,
              width: 64,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="document" size={32} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontSize: 10 }} numberOfLines={1}>
              {file.name}
            </Text>
          </View>
        )
      else if (file.mime.includes('.mp4'))
        return (
          <Video
            source={{ uri: file.uri }}
            volume={0}
            repeat={true}
            resizeMode="contain"
            style={{ height: 64, width: 64 }}
          />
        )
      else
        return (
          <Image
            style={{ height: 64, width: 64 }}
            source={{
              uri: `data:${file.mime};base64,${file.b64}`,
            }}
          />
        )
    }

    const out = []
    if (inlineFiles.length > 0) {
      inlineFiles.forEach((inlineFile, index) => {
        out.push(
          <View
            key={index}
            style={{
              borderColor: theme.colors.primary,
              borderWidth: 2.5,
              borderRadius: 10,
              overflow: 'hidden',
              marginHorizontal: 5,
            }}
          >
            <View
              style={{
                position: 'absolute',
                right: 2,
                top: 2,
                zIndex: 1,
                borderRadius: 100,
                width: 20,
                height: 20,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setInlineFiles([
                    ...inlineFiles.slice(0, index),
                    ...inlineFiles.slice(index + 1),
                  ])
                }}
              >
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            {evalFile(inlineFile)}
          </View>
        )
      })
    } else return null

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 5,
        }}
      >
        {out}
        {!addFileMenuOpened ? (
          <View style={{ paddingHorizontal: 15 }}>{sendAddButton(true)}</View>
        ) : null}
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {chatBubbles()}

      <View
        style={{
          paddingHorizontal: 5,
          paddingTop: 7.5,
        }}
      >
        <ScrollView horizontal={true}>{showInlineFiles()}</ScrollView>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 5,
            paddingVertical: 7.5,
            alignItems: 'center',
          }}
        >
          <TextInput
            ref={inputRef}
            style={{
              maxWidth: '87.5%',
              color: theme.colors.text,
              maxHeight: 60,
              paddingVertical: 5,
              paddingLeft: 12.5,
              borderColor: theme.colors.border,
              borderWidth: 1,
              flexGrow: 99,
              borderRadius: 10,
              backgroundColor: lightenDarkenColor(
                theme.colors.background,
                20 * (theme.dark ? 1 : -1)
              ),
            }}
            multiline={true}
            placeholder="Start typing your message..."
            placeholderTextColor={lightenDarkenColor(
              theme.colors.text,
              150 * (theme.dark ? -1 : 1)
            )}
            value={inputState}
            onChangeText={(change) => setInputState(change)}
            //@ts-ignore
            onImageChange={(event) => {
              const { mime, linkUri, uri, data } = event.nativeEvent

              setInlineFiles([
                ...inlineFiles,
                {
                  mime: mime,
                  b64: data,
                  linkUri: linkUri,
                  uri: uri,
                  name: uri.slice(uri.lastIndexOf('/') + 1, uri.length),
                  renderable: true,
                },
              ])
            }}
          />
          <View style={{ flexGrow: 1, alignItems: 'center' }}>{sendAddButton()}</View>
        </View>
      </View>

      {addFileMenuOpened ? (
        <View style={{ height: 115 }}>
          <ScrollView horizontal={true} style={{ height: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={async () => {
                  try {
                    const res = await DocumentPicker.pickMultiple({
                      type: [DocumentPicker.types.images, DocumentPicker.types.video],
                    })

                    const out = [] as InlineFile[]
                    for (let i = 0; i < res.length; i++) {
                      const file = res[i]

                      out.push({
                        uri: file.uri,
                        mime: file.type as MimeType,
                        b64: await RNFS.readFile(file.uri, 'base64'),
                        name: file.name,
                        renderable: true,
                      })
                    }

                    setInlineFiles([...inlineFiles, ...out])
                  } catch (err) {
                    if (!DocumentPicker.isCancel(err)) throw err
                  }
                }}
              >
                <View
                  style={{
                    ...styles.addFileMenuItem,
                    backgroundColor: lightenDarkenColor(
                      theme.colors.background,
                      25 * (theme.dark ? 1 : -1)
                    ),
                  }}
                >
                  <Icon name="photos" size={64} color={theme.colors.text} />
                  <Text
                    style={{
                      ...styles.addFileMenuItemText,
                      color: theme.colors.text,
                    }}
                  >
                    Gallery
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('GifPicker')}>
                <View
                  style={{
                    ...styles.addFileMenuItem,
                    backgroundColor: lightenDarkenColor(
                      theme.colors.background,
                      25 * (theme.dark ? 1 : -1)
                    ),
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: theme.colors.text,
                      fontSize: 32,
                      lineHeight: 64,
                    }}
                  >
                    GIF
                  </Text>
                  <Text
                    style={{
                      ...styles.addFileMenuItemText,
                      color: theme.colors.text,
                    }}
                  >
                    GIF
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={async () => {
                  try {
                    const res = await DocumentPicker.pickMultiple({
                      type: [
                        DocumentPicker.types.audio,
                        DocumentPicker.types.csv,
                        DocumentPicker.types.doc,
                        DocumentPicker.types.doc,
                        DocumentPicker.types.docx,
                        DocumentPicker.types.pdf,
                        DocumentPicker.types.plainText,
                        DocumentPicker.types.ppt,
                        DocumentPicker.types.pptx,
                        DocumentPicker.types.xls,
                        DocumentPicker.types.xlsx,
                        DocumentPicker.types.zip,
                      ],
                    })

                    const out = [] as InlineFile[]
                    for (let i = 0; i < res.length; i++) {
                      const file = res[i]

                      out.push({
                        uri: file.uri,
                        mime: file.type as MimeType,
                        b64: null,
                        name: file.name,
                        renderable: false,
                      })
                    }

                    setInlineFiles([...inlineFiles, ...out])
                  } catch (err) {
                    if (!DocumentPicker.isCancel(err)) throw err
                  }
                }}
              >
                <View
                  style={{
                    ...styles.addFileMenuItem,
                    backgroundColor: lightenDarkenColor(
                      theme.colors.background,
                      25 * (theme.dark ? 1 : -1)
                    ),
                  }}
                >
                  <Icon name="document" size={64} color={theme.colors.text} />
                  <Text
                    style={{
                      ...styles.addFileMenuItemText,
                      color: theme.colors.text,
                    }}
                  >
                    File
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <View
                  style={{
                    ...styles.addFileMenuItem,
                    backgroundColor: lightenDarkenColor(
                      theme.colors.background,
                      25 * (theme.dark ? 1 : -1)
                    ),
                  }}
                >
                  <Icon name="time" size={64} color="grey" />
                  <Text
                    style={{
                      ...styles.addFileMenuItemText,
                      color: 'grey',
                    }}
                  >
                    More to come...
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  addFileMenuItem: {
    width: 100,
    height: 100,
    marginHorizontal: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  addFileMenuItemText: {
    textAlign: 'center',
    fontSize: 12,
  },
})

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
  messageUpdatesList: state.messageUpdatesListReducer,
  pickedGif: state.pickedGifReducer,
})

const mapDispatchToProps = (dispatch: any) => ({
  addToMessageUpdateList: (messageId: string | string[]) => {
    dispatch({
      type: 'ADD_TO_MESSAGE_UPDATES_LIST',
      payload: { messageID: messageId },
    } as messageUpdatesListReducer.Action)
  },
  dropPickedGif: () => {
    dispatch({
      type: 'DROP_PICKED_GIF',
      payload: {},
    } as pickedGifReducer.Action)
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
function id(id: any, messageID: string) {
  throw new Error('Function not implemented.')
}
