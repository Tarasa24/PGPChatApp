import {InlineFile} from '../../screens/Chat'

const initialState = {}

export type Action = {
  type: 'SET_PICKED_GIF' | 'DROP_PICKED_GIF'
  payload: InlineFile
}

export default function localUserReducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'SET_PICKED_GIF': {
      return action.payload
    }
    case 'DROP_PICKED_GIF': {
      return {}
    }
    default: {
      return state
    }
  }
}
