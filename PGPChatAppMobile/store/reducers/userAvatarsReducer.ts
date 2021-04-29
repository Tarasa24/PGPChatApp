// userID: fileID
const initialState = {} as Map<string, string>

export interface Action {
  type: 'SET_USER_AVATAR' | 'DROP_USER_AVATAR'
  payload: Payload
}

interface Payload {
  userID: string
  fileID?: string
}

export default (state = initialState, { type, payload }: Action) => {
  switch (type) {
    case 'SET_USER_AVATAR':
      return { ...state, [payload.userID]: payload.fileID }
    case 'DROP_USER_AVATAR':
      return { ...state, [payload.userID]: null }
    default:
      return state
  }
}
