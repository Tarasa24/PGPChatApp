// userID: name
const initialState = {} as Map<string, string>

export interface Action {
  type: 'SET_USER_NAME' | 'DROP_USER_NAME'
  payload: Payload
}

interface Payload {
  userID: string
  name?: string
}

export default (state = initialState, { type, payload }: Action) => {
  switch (type) {
    case 'SET_USER_NAME':
      return { ...state, [payload.userID]: payload.name }
    case 'DROP_USER_NAME':
      return { ...state, [payload.userID]: null }
    default:
      return state
  }
}
