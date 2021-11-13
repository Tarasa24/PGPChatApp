import React, { useEffect, useState } from 'react'
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { useTheme } from '../components/ThemeContext'
import Clipboard from '@react-native-clipboard/clipboard'
import Icon from 'react-native-ionicons'
import Toast from 'react-native-toast-message'
import DocumentPicker from 'react-native-document-picker'
import { File, User } from '../assets/ts/orm'

import * as RNFS from 'react-native-fs'
import { getConnection, getRepository } from 'typeorm'
import Avatar from '../components/Avatar'

import * as localUserReducer from '../store/reducers/localUserReducer'
import * as userAvatarsReducer from '../store/reducers/userAvatarsReducer'
import RNFetchBlob from 'rn-fetch-blob'
import * as userNamesReducer from '../store/reducers/userNamesReducer'
import Gallery from './Gallery'

export interface RouteParams {
  user: User
}

interface Props {
  reduxSetLight: () => void
  reduxSetDark: () => void
  localUser: localUserReducer.LocalUserState
  userAvatars: Map<string, string>
  setAvatar: (userID: string, fileID: string) => void
  dropAvatar: (userID: string) => void
  setNameDispatch: (userID: string, name: string) => void
  route: {
    params: RouteParams
  }
}

export function Profile(props: Props) {
  const theme = useTheme()

  const isSelf = props.route.params.user.id === props.localUser.id

  const [showSaveButton, setShowSaveButton] = useState(false)
  const [name, setName] = useState(props.route.params.user.name)

  useEffect(() => {
    if (name !== props.route.params.user.name) {
      setShowSaveButton(true)
    }
  }, [name])

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

  async function saveImageToDB(uri: string, mime: string, name: string) {
    const userRepository = getRepository(User)
    const fileRepository = getRepository(File)

    let localUser = await userRepository.findOneOrFail({
      id: props.route.params.user.id,
    })

    // Remove relation and delete pervious picture if exists
    removeImageFromUser(localUser)

    // Save new picture
    const picture = new File()
    picture.mime = mime
    picture.name = name
    picture.uri = `${RNFS.ExternalStorageDirectoryPath}/PGPChatApp/${Date.now()}-${name}`

    await RNFS.mkdir(RNFS.ExternalStorageDirectoryPath + '/PGPChatApp')
    await RNFS.writeFile(picture.uri, await RNFS.readFile(uri, 'base64'), 'base64')

    // Calculate hash
    const fileHash = await RNFetchBlob.fs.hash(picture.uri, 'sha256')

    // Check if a file with the same hash exists
    const hashedFiles = await fileRepository.find({ where: { hash: fileHash } })

    // If it does, unlink the new file and use previous uri
    if (hashedFiles.length >= 1) {
      RNFetchBlob.fs.unlink(picture.uri)
      picture.uri = hashedFiles[0].uri
    } else picture.hash = fileHash

    localUser.picture = await fileRepository.save(picture)

    const updatedUser = await userRepository.save(localUser)

    // Update reducer
    props.setAvatar(updatedUser.id, updatedUser.picture.id)
  }

  async function selectImage() {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      })

      saveImageToDB(res.uri, res.type, res.name)
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) throw err
    }
  }

  function clearAvatarButton() {
    if (props.userAvatars[props.route.params.user.id])
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
                  id: props.route.params.user.id,
                })
                .then((localUser) => {
                  props.dropAvatar(localUser.id)
                  removeImageFromUser(localUser)
                })
            }
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

  async function exportPrivateKey() {
    const uri = `${RNFS.ExternalStorageDirectoryPath}/PGPChatApp/${props.localUser.id}.asc`

    await RNFS.mkdir(RNFS.ExternalStorageDirectoryPath + '/PGPChatApp')

    await RNFS.writeFile(uri, props.localUser.privateKey, 'utf8')

    return uri
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
          <View style={{ marginBottom: 2.5, position: 'relative', padding: 7.5 }}>
            <TouchableOpacity disabled={isSelf} activeOpacity={0.7} onPress={selectImage}>
              <Avatar userID={props.route.params.user.id} size={100} />
            </TouchableOpacity>
            {clearAvatarButton()}
          </View>

          {!isSelf && (
            <View
              style={{
                overflow: 'hidden',
                maxWidth: '100%',
                paddingHorizontal: 40,
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Nickname"
                value={name}
                multiline={false}
                onChangeText={(change) => setName(change.length === 0 ? null : change)}
              />
              {showSaveButton && (
                <View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: theme.colors.primary,
                      height: 45,
                      width: 45,
                      marginLeft: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 100,
                    }}
                    onPress={async () => {
                      props.route.params.user.name = name
                      setName(name)
                      setShowSaveButton(false)
                      const userRepository = getRepository(User)
                      await userRepository.save(props.route.params.user)

                      props.setNameDispatch(props.route.params.user.id, name)
                    }}
                  >
                    <Icon name="save" color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
            }}
            onPress={() => {
              Toast.show({
                type: 'info',
                position: 'bottom',
                text1: 'ChatApp ID copied',
                visibilityTime: 1500,
              })
              Clipboard.setString(props.route.params.user.id)
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 19 }}>
              {props.route.params.user.id}
            </Text>
            <Icon
              name="copy"
              size={21}
              style={{ marginLeft: 10 }}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        {isSelf && (
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
            <View style={styles.rowContainer}>
              <Text style={{ color: theme.colors.text }}>GF mode</Text>
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
                onValueChange={() => console.log('GF')}
                value={false}
              />
            </View>

            <View
              style={{
                marginTop: 30,
                alignSelf: 'center',
                width: '60%',
              }}
            >
              <Button
                onPress={() => {
                  Alert.alert(
                    'Are you sure you want to proceed?',
                    'Exporting the private key will make it accessible to any application given enough permission, which will inevitably lower the overal security. The only time you should be exporting the private key is in order to switch devices.',
                    [
                      {
                        text: 'Abort',
                        style: 'cancel',
                      },
                      {
                        text: 'Proceed',
                        onPress: () => {
                          exportPrivateKey().then((uri) => {
                            Toast.show({
                              type: 'success',
                              position: 'bottom',
                              text1: 'Private Key has been successfully exported',
                              text2: uri,
                              visibilityTime: 5000,
                            })
                          })
                        },
                      },
                    ]
                  )
                }}
                title="Export private key"
                color={theme.colors.primary}
              />
            </View>
          </View>
        )}

        {!isSelf && (
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                textAlign: 'center',
                color: theme.colors.text,
                marginVertical: 15,
                fontSize: 25,
              }}
            >
              Gallery
            </Text>
            <Gallery route={{ params: { user: props.route.params.user } }} />
          </View>
        )}
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
  setNameDispatch: (userID: string, name: string) =>
    dispatch({
      type: 'SET_USER_NAME',
      payload: { userID: userID, name: name },
    } as userNamesReducer.Action),
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
  input: {
    flexGrow: 1,
    textAlign: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderColor: '#dadada',
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 21,
  },
})
