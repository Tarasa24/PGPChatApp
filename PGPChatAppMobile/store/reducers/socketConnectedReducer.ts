export enum StateEnum {
  Disconnected,
  Connecting,
  Connected,
}

const initialState = StateEnum.Connecting

export interface Action {
  type:
    | 'SET_SOCKET_DISCONNECTED'
    | 'SET_SOCKET_CONNECTING'
    | 'SET_SOCKET_CONNECTED'
  payload: {}
}

export default (state = initialState, { type, payload }: Action) => {
  switch (type) {
    case 'SET_SOCKET_CONNECTED':
      return StateEnum.Connected
    case 'SET_SOCKET_CONNECTING':
      return StateEnum.Connecting
    case 'SET_SOCKET_DISCONNECTED':
      return StateEnum.Disconnected
    default:
      return state
  }
}
