const initialState = {} as Map<string, string>

export interface Action {
  type: 'SET_DRAFT' | 'DROP_DRAFT'
  payload: Payload
}

interface Payload {
  userID: string
  draftText?: string
}

export default (state = initialState, { type, payload }: Action) => {
  switch (type) {
    case 'SET_DRAFT':
      return { ...state, [payload.userID]: payload.draftText }
    case 'DROP_DRAFT':
      return { ...state, [payload.userID]: null }
    default:
      return state
  }
}
