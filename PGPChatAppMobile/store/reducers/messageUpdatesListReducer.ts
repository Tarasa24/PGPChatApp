// userID: messageID
const initialState = [] as string[]

export interface Action {
  type: 'ADD_TO_MESSAGE_UPDATES_LIST'
  payload: Payload
}

interface Payload {
  messageID: string | string[]
}

export default (state = initialState, { type, payload }: Action) => {
  switch (type) {
    case 'ADD_TO_MESSAGE_UPDATES_LIST':
      return [...state, payload.messageID]
    default:
      return state
  }
}
