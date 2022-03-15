const initialState = [] as string[]

export interface Action {
  type: 'ADD_ID_TO_BLOCKLIST' | 'REMOVE_ID_FROM_BLOCKLIST'
  payload: Payload
}

interface Payload {
  userID: string
}

export default (state = initialState, { type, payload }: Action) => {
  switch (type) {
    case 'ADD_ID_TO_BLOCKLIST':
      return [...state, payload.userID]
    case 'REMOVE_ID_FROM_BLOCKLIST':
      return state.filter((val) => val !== payload.userID)
    default:
      return state
  }
}
