import React, { useEffect, useState } from 'react'
import { getConnection } from 'typeorm'
import { File, Message, User } from '../assets/ts/orm'
import { useTheme } from '../components/ThemeContext'
import * as RNFS from 'react-native-fs'
import { ActivityIndicator, Image, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-ionicons'
import { PreviewFileType } from './PreviewFile'
import { useNavigation } from '@react-navigation/native'

export interface RouteParams {
  user: User
}

interface Props {
  route: {
    params: RouteParams
  }
}

export default function Gallery(props: Props) {
  const [files, setFiles] = useState([] as PreviewFileType[])
  const theme = useTheme()
  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      let out = await getConnection()
        .createQueryBuilder()
        .select('message.id', 'id')
        .addSelect('message.timestamp', 'timestamp')
        .from(Message, 'message')
        .where('message.author = :from', { from: props.route.params.user.id })
        .orWhere('message.recipient = :to', { to: props.route.params.user.id })
        .execute()

      let ids = {}
      out.forEach((e) => {
        ids[e.id] = e.timestamp
      })

      const f: PreviewFileType[] = await getConnection()
        .createQueryBuilder()
        .select()
        .from(File, 'file')
        .where(`parentMessageId In('${Object.keys(ids).join("', '")}')`)
        .execute()

      for (let i = 0; i < f.length; i++) {
        if (f[i].renderable) {
          f[i].b64 = await RNFS.readFile(f[i].uri, 'base64')
        }
      }

      setFiles(
        f.sort((a, b) => {
          return ids[b.parentMessageId] - ids[a.parentMessageId]
        })
      )
    })()
  }, [])

  function renderFiles() {
    const out = []

    files.forEach((file, i) => {
      if (file.renderable)
        out.push(
          <View key={i} style={{ height: 200, width: '50%' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('PreviewFile', { file: file })
              }}
            >
              <Image
                style={{ height: 200, width: '100%' }}
                source={{
                  uri: `data:${file.mime};base64,${file.b64}`,
                }}
              />
            </TouchableOpacity>
          </View>
        )
      else
        out.push(
          <View
            key={i}
            style={{
              height: 200,
              width: '50%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('PreviewFile', { file: file })
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  minWidth: '100%',
                  minHeight: '100%',
                }}
              >
                <Icon name="document" size={64} color={theme.colors.text} />
                <Text style={{ color: theme.colors.text }}>{file.name}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )
    })

    return out
  }

  return (
    <View
      style={{ backgroundColor: theme.colors.background, minHeight: '100%' }}
    >
      {files.length > 0 ? (
        <ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderFiles()}
          </View>
        </ScrollView>
      ) : (
        <View style={{ minHeight: '100%', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  )
}
