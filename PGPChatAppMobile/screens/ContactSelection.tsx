import CheckBox from '@react-native-community/checkbox'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { getRepository, Not } from 'typeorm'
import { User } from '../assets/ts/orm'
import Avatar from '../components/Avatar'
import { useTheme } from '../components/ThemeContext'
import * as draftReducer from '../store/reducers/draftReducer'
import { LocalUserState } from '../store/reducers/localUserReducer'

export interface RouteParams {
  chatID: string
}

interface Props {
  route: {
    params: RouteParams
  }
  localUser: LocalUserState
  setDraft: (userID: string, draftText: string) => void
}

function ContactSelection(props: Props) {
  const theme = useTheme()
  const navigation = useNavigation()

  const [contacts, setContacts] = useState([] as User[])
  const [selection, setSelection] = useState({})

  useEffect(() => {
    ;(async function () {
      const userRepository = getRepository(User)
      setContacts(
        await userRepository.find({
          where: { id: Not(props.localUser.id) },
        })
      )
    })()
  }, [])

  function tickContact(contactID) {
    const temp = {}
    temp[contactID] = !selection[contactID]
    setSelection({ ...selection, ...temp })
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <ScrollView>
        {contacts.map((contact) => {
          return (
            <View
              key={contact.id}
              style={{
                flexDirection: 'row',
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexGrow: 1,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => tickContact(contact.id)}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginHorizontal: 10,
                    }}
                  >
                    <Avatar userID={contact.id} size={60} />
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: theme.colors.text,
                        marginLeft: 10,
                        flex: 1,
                        flexGrow: 1,
                      }}
                      numberOfLines={1}
                    >
                      {contact.name ? contact.name : contact.id}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ marginLeft: 10, justifyContent: 'center' }}>
                <CheckBox
                  tintColors={{ true: theme.colors.primary, false: theme.colors.text }}
                  value={selection[contact.id]}
                  onValueChange={() => tickContact(contact.id)}
                />
              </View>
            </View>
          )
        })}
      </ScrollView>
      <View style={{ marginTop: 10 }}>
        <Button
          color={theme.colors.primary}
          title="Select"
          disabled={Object.keys(selection).filter((val) => selection[val]).length === 0}
          onPress={() => {
            const s = Object.keys(selection).filter((val) => selection[val])
            props.setDraft(props.route.params.chatID, s.join('\n'))
            navigation.goBack()
          }}
        />
      </View>
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
})

const mapDispatchToProps = (dispatch: any) => ({
  setDraft: (userID: string, draftText: string) =>
    dispatch({
      type: 'SET_DRAFT',
      payload: { userID: userID, draftText: draftText },
    } as draftReducer.Action),
})

export default connect(mapStateToProps, mapDispatchToProps)(ContactSelection)

const styles = StyleSheet.create({})
