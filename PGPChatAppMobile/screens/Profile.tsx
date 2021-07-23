import React from 'react'
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { useTheme } from '../components/ThemeContext'
import Clipboard from '@react-native-clipboard/clipboard'
import Icon from 'react-native-ionicons'
import Toast from 'react-native-toast-message'
import DocumentPicker, { MimeType } from 'react-native-document-picker'
import { File, User } from '../assets/ts/orm'
import randomWords from 'random-words'

import * as RNFS from 'react-native-fs'
import { getConnection, getRepository } from 'typeorm'
import Avatar from '../components/Avatar'

import * as localUserReducer from '../store/reducers/localUserReducer'
import * as userAvatarsReducer from '../store/reducers/userAvatarsReducer'

interface Props {
  reduxSetLight: () => void
  reduxSetDark: () => void
  localUser: localUserReducer.LocalUserState
  userAvatars: Map<string, string>
  setAvatar: (userID: string, fileID: string) => void
  dropAvatar: (userID: string) => void
}

export function Profile(props: Props) {
  const theme = useTheme()

  function handleDarkMode() {
    theme.dark ? props.reduxSetLight() : props.reduxSetDark()
    theme.toggleScheme()
  }

  async function removeImageFromUser(localUser: User) {
    const fileRepository = getRepository(File)
    await getConnection()
      .createQueryBuilder()
      .relation(User, 'picture')
      .of(localUser)
      .set(null)
    if (localUser.picture) await fileRepository.remove(localUser.picture)
  }

  async function saveImageToDB(uri: string, mime: MimeType, name: string) {
    const userRepository = getRepository(User)
    const fileRepository = getRepository(File)

    let localUser = await userRepository.findOneOrFail({
      id: props.localUser.id,
    })

    // Remove relation and delete pervious picture if exists
    removeImageFromUser(localUser)

    // Save new picture
    const picture = new File()
    picture.mime = mime
    picture.name = name
    picture.uri = `${RNFS.ExternalStorageDirectoryPath}/PGPChatApp/${Date.now()}-${name}`

    await RNFS.mkdir(RNFS.ExternalStorageDirectoryPath + '/PGPChatApp')
    await RNFS.writeFile(
      picture.uri,
      await RNFS.readFile(uri, 'base64'),
      'base64'
    )

    localUser.picture = await fileRepository.save(picture)

    const updatedUser = await userRepository.save(localUser)

    // Update reducer
    props.setAvatar(updatedUser.id, updatedUser.picture.id)
  }

  async function selectImage() {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      })
      saveImageToDB(res.uri, res.type as MimeType, res.name)
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) throw err
    }
  }

  function clearAvatarButton() {
    if (props.userAvatars[props.localUser.id])
      return (
        <View
          style={{
            position: 'absolute',
            right: 0,
            zIndex: 9,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              // Add confirmation
              getRepository(User)
                .findOneOrFail({
                  id: props.localUser.id,
                })
                .then((localUser) => {
                  props.dropAvatar(localUser.id)
                  removeImageFromUser(localUser)
                })}
          >
            <View
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 100,
                width: 35,
                height: 35,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="close" color="white" />
            </View>
          </TouchableOpacity>
        </View>
      )
  }

  return (
    <View style={{ height: '100%', backgroundColor: theme.colors.background }}>
      <Toast ref={(ref) => Toast.setRef(ref)} style={{ zIndex: 9 }} />
      <ScrollView>
        <View
          style={{
            marginVertical: 20,
            alignItems: 'center',
          }}
        >
          <View
            style={{ marginBottom: 2.5, position: 'relative', padding: 7.5 }}
          >
            <TouchableOpacity activeOpacity={0.7} onPress={selectImage}>
              <Avatar userID={props.localUser.id} size={100} />
            </TouchableOpacity>
            {clearAvatarButton()}
          </View>

          <TextInput
            style={{ color: theme.colors.text, fontSize: 24, marginBottom: 5 }}
            maxLength={32}
            multiline={false}
            onChangeText={(text) => console.log(text)}
            placeholder={randomWords({
              exactly: 1,
              wordsPerString: 3,
              separator: '-',
              join: '',
            })}
            placeholderTextColor="gray"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Toast.show({
                type: 'info',
                position: 'bottom',
                text1: 'ChatApp ID copied',
                visibilityTime: 1500,
              })
              Clipboard.setString(props.localUser.id)
            }}
          >
            <Text style={{ color: theme.colors.text }}>
              {props.localUser.id}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'column',
            marginTop: 20,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: theme.colors.text,
              marginVertical: 15,
              fontSize: 25,
            }}
          >
            Settings
          </Text>
          <View style={styles.rowContainer}>
            <Text style={{ color: theme.colors.text }}>Dark mode</Text>
            <Switch
              trackColor={{
                false: lightenDarkenColor(
                  theme.colors.primary,
                  100 * (theme.dark ? -1 : 1)
                ),
                true: lightenDarkenColor(
                  theme.colors.primary,
                  100 * (theme.dark ? -1 : 1)
                ),
              }}
              thumbColor={theme.colors.primary}
              onValueChange={handleDarkMode}
              value={theme.dark}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
  userAvatars: state.userAvatarsReducer,
})

const mapDispatchToProps = (dispatch: any) => ({
  reduxSetDark: () => dispatch({ type: 'SET_DARK' }),
  reduxSetLight: () => dispatch({ type: 'SET_LIGHT' }),
  setAvatar: (userID: string, fileID: string) =>
    dispatch({
      type: 'SET_USER_AVATAR',
      payload: { userID: userID, fileID: fileID },
    } as userAvatarsReducer.Action),
  dropAvatar: (userID: string) =>
    dispatch({
      type: 'DROP_USER_AVATAR',
      payload: { userID: userID },
    } as userAvatarsReducer.Action),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)

const styles = StyleSheet.create({
  rowContainer: {
    marginTop: 5,
    alignSelf: 'center',
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
