import { StackActions, useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { View, Alert, Image, ToastAndroid } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { RTCView, mediaDevices, MediaStream } from 'react-native-webrtc'
import Peer from 'react-native-peerjs'
import { CallPayload, socket } from '../assets/ts/socketio'
import Avatar from '../components/Avatar'
import { useTheme } from '../components/ThemeContext'
import { store } from '../store/store'
import DeviceInfo from 'react-native-device-info'
import RNSoundLevel from 'react-native-sound-level'
import Animated, { Easing } from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'

export interface RouteParams {
  caller: string
  callerPeerToken: string
  callee: string
  calleePeerToken: string
}

interface Props {
  route: {
    params: RouteParams
  }
}

export default function Call(props: Props) {
  const navigation = useNavigation()
  const theme = useTheme()

  const amICaller =
    props.route.params.caller === store.getState().localUserReducer.id

  const [call, setCall] = useState(null)
  const [peer, setPeer] = useState(null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [localCamera, setLocalCamera] = useState(false)
  const [localMic, setlocalMic] = useState(true)
  const [localMicLevel, setLocalMicLevel] = useState(-160)

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [remoteCamera, setRemoteCamera] = useState(false)
  const [remoteMic, setRemoteMic] = useState(true)
  const [remoteMicLevel, setRemoteMicLevel] = useState(-160)

  const [dataConnection, setDataConnection] = useState(null)

  const [stop, setStop] = useState(false)

  async function setupLocalStream() {
    // Setup Local stream
    let isFront = true
    const sourceInfos = await mediaDevices.enumerateDevices()

    let videoSourceId
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i]
      if (
        sourceInfo.kind == 'videoinput' &&
        sourceInfo.facing == (isFront ? 'front' : 'environment')
      ) {
        videoSourceId = sourceInfo.deviceId
      }
    }

    const stream = (await mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720,
          minFrameRate: 30,
        },
        facingMode: isFront ? 'user' : 'environment',
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      },
    })) as MediaStream

    stream.getVideoTracks().forEach((vt) => (vt.enabled = false))

    setLocalStream(stream)
    return stream
  }

  function closeCall() {
    socket.emit('endCall', {
      caller: props.route.params.caller,
      callee: props.route.params.callee,
    } as CallPayload)
    dataConnection && dataConnection.send('endCall')

    call && call.close()
    setCall(null)

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      localStream.release()
    }
    setLocalStream(null)

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
      remoteStream.release()
    }
    setRemoteStream(null)

    dataConnection && dataConnection.close()
    setDataConnection(null)

    peer.destroy()
    setPeer(null)
  }

  function handleCall(call) {
    setCall(call)
    call.on('stream', (stream) => setRemoteStream(stream))
  }

  function handleDataConnection(connection) {
    setDataConnection(connection)
    connection.on('open', () =>
      connection.on('data', (data: string) => {
        switch (data) {
          case 'endCall':
            setStop(true)
            navigation.goBack()
            break
          case 'showVideo':
            setRemoteCamera(true)
            break
          case 'hideVideo':
            setRemoteCamera(false)
            break
          case 'mute':
            setRemoteMic(false)
            break
          case 'unmute':
            setRemoteMic(true)
            break
          default:
            if (data.includes('setVoiceVolume')) {
              setRemoteMicLevel(Number(data.split(' ')[1]))
            }
            break
        }
      })
    )
  }

  const peerConfig = {
    host: __DEV__
      ? DeviceInfo.isEmulatorSync() ? '10.0.2.2' : '192.168.1.82'
      : 'chatapp.tarasa24.dev',
    port: __DEV__ ? 5000 : 443,
    secure: !__DEV__,
    path: __DEV__ ? '/peerjs' : '/app-api/peerjs',
    debug: 1,
  }

  useEffect(() => {
    const peer = new Peer(
      amICaller
        ? props.route.params.callerPeerToken
        : props.route.params.calleePeerToken,
      peerConfig
    )
    setPeer(peer)
    setupLocalStream().then((localStream) => {
      if (amICaller) {
        peer.on('call', (call) => {
          call.answer(localStream)
          handleCall(call)
        })
        peer.on('connection', (conn) => handleDataConnection(conn))
      } else {
        handleCall(peer.call(props.route.params.callerPeerToken, localStream))
        handleDataConnection(peer.connect(props.route.params.callerPeerToken))
      }
    })

    peer.on('error', (e) => {
      console.error(e)
      setStop(true)
      navigation.goBack()
    })

    RNSoundLevel.start()
    RNSoundLevel.onNewFrame = (data) => {
      setLocalMicLevel(data.value)
    }

    return () => {
      RNSoundLevel.stop()
    }
  }, [])

  useEffect(
    () => {
      navigation.addListener('beforeRemove', (e) => {
        setStop(true)
      })
    },
    [navigation]
  )

  // It's not dumb as long as it works
  useEffect(
    () => {
      if (stop === true) {
        closeCall()
      }
    },
    [stop]
  )

  useEffect(
    () => {
      if (dataConnection && localMic && !localCamera)
        dataConnection.send('setVoiceVolume ' + localMicLevel)
    },
    [localMicLevel]
  )

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <View style={{ minHeight: '100%' }}>
        <View
          style={{
            flex: 1.2,
            width: '100%',
          }}
        >
          {remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              objectFit="cover"
              style={{
                height: remoteCamera ? '100%' : 0,
                width: '100%',
              }}
            />
          )}
          {!remoteCamera && (
            <View
              style={{
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Avatar
                userID={
                  !amICaller ? (
                    props.route.params.caller
                  ) : (
                    props.route.params.callee
                  )
                }
                size={120}
              />
              <VoiceActivity
                voiceLevel={remoteMic && !remoteCamera ? remoteMicLevel : -160}
              />
            </View>
          )}
        </View>
        <View style={{ height: 10, backgroundColor: theme.colors.border }} />
        <View
          style={{
            flex: 1,
            width: '100%',
          }}
        >
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              objectFit="cover"
              style={{
                height: localCamera ? '100%' : 0,
                width: '100%',
              }}
            />
          )}
          {localCamera && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  // @ts-expect-error
                  localStream.getVideoTracks()[0]._switchCamera()
                }}
                onLongPress={() => {
                  ToastAndroid.showWithGravity(
                    'Switch camera',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM
                  )
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.primary,
                    width: 40,
                    height: 40,
                    borderRadius: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name="reverse-camera"
                    size={20}
                    color={theme.colors.text}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {!localCamera && (
            <View
              style={{
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Avatar
                userID={
                  amICaller ? (
                    props.route.params.caller
                  ) : (
                    props.route.params.callee
                  )
                }
                size={120}
              />
              <VoiceActivity
                voiceLevel={localMic && !localCamera ? localMicLevel : -160}
              />
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!dataConnection}
          onPress={() => {
            localStream
              .getVideoTracks()
              .forEach((vt) => (vt.enabled = !localCamera))
            dataConnection.send(localCamera ? 'hideVideo' : 'showVideo')
            setLocalCamera(!localCamera)
          }}
          onLongPress={() => {
            ToastAndroid.showWithGravity(
              localCamera ? 'Hide video' : 'Show video',
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            )
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.border,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 50,
              marginHorizontal: 5,
              opacity: !dataConnection ? 0.25 : 1,
            }}
          >
            <Icon
              name={!localCamera ? 'videocam' : 'eye-off'}
              color={theme.colors.text}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert(
              'End the call',
              'Do you really wish to end ongoing call',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'End',
                  onPress: () => {
                    setStop(true)
                    navigation.goBack()
                  },
                },
              ]
            )}
          onLongPress={() => {
            ToastAndroid.showWithGravity(
              'End call',
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            )
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 50,
              marginHorizontal: 5,
            }}
          >
            <Icon
              name="call"
              style={{ transform: [{ rotate: '135deg' }] }}
              color={theme.colors.text}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!dataConnection}
          onPress={() => {
            localStream
              .getAudioTracks()
              .forEach((vt) => (vt.enabled = !localMic))
            dataConnection.send(localMic ? 'mute' : 'unmute')
            setlocalMic(!localMic)
          }}
          onLongPress={() => {
            ToastAndroid.showWithGravity(
              localMic ? 'Mute' : 'Unmute',
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            )
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.border,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 50,
              marginHorizontal: 5,
              opacity: !dataConnection ? 0.25 : 1,
            }}
          >
            <Icon
              name={!localMic ? 'mic' : 'mic-off'}
              color={theme.colors.text}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function VoiceActivity(props: { voiceLevel: number }) {
  const AnimatedView = Animated.createAnimatedComponent(View)
  const scaled = useRef(new Animated.Value(-160)).current

  Animated.timing(
    // Animate over time
    scaled,
    {
      easing: Easing.ease,
      toValue: props.voiceLevel,
      duration: 250,
    }
  ).start()

  return (
    <AnimatedView
      style={{
        position: 'absolute',
        zIndex: -1,
        opacity: scaled.interpolate({
          inputRange: [-160, 0],
          outputRange: [0.1, 0.7],
        }),
        transform: [
          {
            scale: scaled.interpolate({
              inputRange: [-160, 0],
              outputRange: [1, 2.5],
            }),
          },
        ],
      }}
    >
      <Svg height="120" width="120">
        <Circle cx="60" cy="60" r="50" fill="white" />
      </Svg>
    </AnimatedView>
  )
}
