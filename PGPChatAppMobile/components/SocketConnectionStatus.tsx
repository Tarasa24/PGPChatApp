import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import * as socketConnectedReducer from '../store/reducers/socketConnectedReducer'

interface Props {
  socketConnected: socketConnectedReducer.StateEnum
}

function SocketConnectionStatus(props: Props) {
  const variants = {
    disconnected: ['#8e0b00', 'Disconnected ❌'],
    connecting: ['#d6a506', 'Connecting ⏳'],
    connected: ['#1b8711', 'Connected ✅'],
  }
  const [selectedVariant, setSelectedVariant] = useState(variants.connecting)

  useEffect(() => {
    switch (props.socketConnected) {
      case socketConnectedReducer.StateEnum.Disconnected:
        setSelectedVariant(variants.disconnected)
        break
      case socketConnectedReducer.StateEnum.Connecting:
        setSelectedVariant(variants.connecting)
        break
      case socketConnectedReducer.StateEnum.Connected:
        setSelectedVariant(variants.connected)
        break
    }
  }, [props.socketConnected])
  return (
    <View
      style={{
        width: '100%',
        backgroundColor: selectedVariant[0],
        paddingVertical: 5,
      }}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>
        Connection status:{' '}
        <Text style={{ fontWeight: 'bold' }}>{selectedVariant[1]}</Text>
      </Text>
    </View>
  )
}

const mapStateToProps = (state: any) => ({
  socketConnected: state.socketConnectedReducer,
})

const mapDispatchToProps = (dispatch: any) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(SocketConnectionStatus)
