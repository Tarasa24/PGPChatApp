import * as React from 'react'
import { connect } from 'react-redux'
import { LocalUserState } from '../store/reducers/localUserReducer'

const Component = (props: {
  children: React.ReactNode
  Stack: any
  localUser: LocalUserState
}) => {
  return (
    <props.Stack.Navigator
      initialRouteName={!props.localUser.id ? 'LandingPage' : 'Chats'}
    >
      {props.children}
    </props.Stack.Navigator>
  )
}

const mapStateToProps = (state: any) => ({
  localUser: state.localUserReducer,
})

export default connect(mapStateToProps, {})(Component)
