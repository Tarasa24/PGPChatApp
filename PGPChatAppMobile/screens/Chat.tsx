import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { Message, MessageRaw, MessageStatus, User } from '../assets/ts/orm'
import ChatHeader from '../components/ChatHeader'
import { useTheme } from '../components/ThemeContext'
import ChatBubble from '../components/ChatBubble'
import { getRepository } from 'typeorm'
import { LocalUserState } from '../store/reducers/localUserReducer'
import { connect } from 'react-redux'
import {
  socket,
  SendPayload,
  MessageUpdatePayload,
} from '../assets/ts/socketio'
import OpenPGP from 'react-native-fast-openpgp'
import * as messageUpdatesListReducer from '../store/reducers/messageUpdatesListReducer'

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

  async function loadMessages() {
    const messageRepository = getRepository(Message)

    const messages = await messageRepository
      .createQueryBuilder()
      .where(
        `(recipientId = '${props.route.params.participants.self
          .id}' AND authorId = '${props.route.params.participants.other.id}')`
      )
      .orWhere(
        `(recipientId = '${props.route.params.participants.other
          .id}' AND authorId = '${props.route.params.participants.self.id}')`
      )
      .select(['id', 'timestamp', 'text', 'authorId AS author', 'status'])
      .orderBy('timestamp', 'DESC')
      .getRawMany()

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

      await messageRepository.update(
        { id: message.id },
        { status: MessageStatus.read }
      )
    }

    if (unread.length > 0)
      props.addToMessageUpdateList(unread.map((msg) => msg.id))
  }

  useEffect(() => {
    navigation.setOptions({
      header: () => <ChatHeader user={props.route.params.participants.other} />,
    })
  }, [])

  useEffect(
    () => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          scrollViewRef.scrollToEnd({ animated: false })
        }
      )
      return () => {
        keyboardDidShowListener.remove()
      }
    },
    [scrollViewRef]
  )

  useEffect(
    () => {
      loadMessages().then(() => {
        if (scrollViewRef) scrollViewRef.scrollToEnd({ animated: false })
        sendReadStatus()
      })
    },
    [props.messageUpdatesList]
  )

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
    socket.emit('send', {
      id: message.id,
      timestamp: message.timestamp,
      message: {
        content: await OpenPGP.encrypt(
          message.text,
          props.route.params.participants.other.publicKey
        ),
        signature: await OpenPGP.sign(
          message.text,
          props.localUser.publicKey,
          props.localUser.privateKey,
          ''
        ),
      },
      from: props.route.params.participants.self.id,
      to: props.route.params.participants.other.id,
    } as SendPayload)

    props.addToMessageUpdateList(message.id)

    scrollViewRef.scrollToEnd()
  }

  function addFile() {}

  function sendAddButton() {
    if (inputState)
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
            addFile()
          }}
        >
          <Icon color="white" name="add" />
        </TouchableOpacity>
      )
  }

  function chatBubbles() {
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
            if (ref) ref.scrollToEnd({ animated: false })
          }}
        >
          <View
            style={{
              flexGrow: 1,
              flexDirection: 'column-reverse',
            }}
          >
            {messages.map((m, i) => {
              return (
                <ChatBubble
                  message={m as any}
                  key={m.id}
                  onDelete={async (messageID) => {
                    const messageRepository = getRepository(Message)
                    await messageRepository.delete({ id: messageID })

                    setMessages([
                      ...messages.slice(0, i),
                      ...messages.slice(i + 1),
                    ])

                    socket.emit('messageUpdate', {
                      action: 'DELETE',
                      messageId: messageID,
                      to: props.route.params.participants.other.id,
                    } as MessageUpdatePayload & { to: string })

                    props.addToMessageUpdateList(messageID)
                  }}
                />
              )
            })}
          </View>
        </ScrollView>
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
        />
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          {sendAddButton()}
        </View>
      </View>
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
  messageUpdatesList: state.messageUpdatesListReducer,
})

const mapDispatchToProps = (dispatch: any) => ({
  addToMessageUpdateList: (messageId: string | string[]) => {
    dispatch({
      type: 'ADD_TO_MESSAGE_UPDATES_LIST',
      payload: { messageID: messageId },
    } as messageUpdatesListReducer.Action)
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
