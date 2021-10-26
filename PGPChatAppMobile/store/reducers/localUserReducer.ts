import { Action } from 'redux'

export interface LocalUserState {
  id: string
  publicKey: string
  privateKey: string
}

const initialState = {
  id: null,
  publicKey: null,
  privateKey: null,
}

interface LocalUserAction extends Action {
  payload: LocalUserState
}

export default function localUserReducer(state = initialState, action: LocalUserAction) {
  switch (action.type) {
    case 'SET_LOCAL_USER': {
      return action.payload
    }
    default: {
      return state
    }
  }
}
