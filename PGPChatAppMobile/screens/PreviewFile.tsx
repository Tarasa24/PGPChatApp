import React, { useEffect, useState } from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { getRepository } from 'typeorm'
import { Message } from '../assets/ts/orm'
import { useTheme } from '../components/ThemeContext'
import FileViewer from 'react-native-file-viewer'

export interface PreviewFileType {
  renderable: boolean
  mime: string
  b64: string
  linkUri?: string
  uri: string
  name: string
  parentMessageId: string
}

interface Props {
  route: {
    params: {
      file: PreviewFileType
    }
  }
}

export default function PreviewFile(props: Props) {
  const theme = useTheme()

  const [parentMessage, setParentMessage] = useState({} as Message)

  useEffect(() => {
    ;(async () => {
      const messageRepository = getRepository(Message)
      setParentMessage(
        await messageRepository.findOne({
          where: { id: props.route.params.file.parentMessageId },
        })
      )
    })()
  }, [])

  function showFile() {
    if (props.route.params.file.renderable)
      return (
        <Image
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height - 175,
          }}
          resizeMode={'contain'}
          source={{
            uri: `data:${props.route.params.file.mime};base64,${props.route.params.file.b64}`,
          }}
        />
      )
    else
      return (
        <View
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height - 175,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="document" color={theme.colors.text} size={128} />
          <Text style={{ color: theme.colors.text }}>{props.route.params.file.name}</Text>
        </View>
      )
  }

  return (
    <View style={{ minHeight: '100%', backgroundColor: 'black' }}>
      <View style={{ flex: 3 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            FileViewer.open(props.route.params.file.uri)
          }}
        >
          {showFile()}
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, height: 175, backgroundColor: 'rgba(0,0,0,.4)' }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {props.route.params.file.uri}
        </Text>
        <Text style={{ color: 'grey', textAlign: 'center', marginTop: 5 }}>
          {new Date(parentMessage.timestamp).toString()}
        </Text>
      </View>
    </View>
  )
}
