import { Appearance } from 'react-native'
import { Action } from 'redux'

Appearance.getColorScheme()

const initialState = {
  colorScheme:
    Appearance.getColorScheme() === null ? 'light' : Appearance.getColorScheme(),
}

export default function colorSchemeReducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'SET_DARK':
      return {
        ...state,
        colorScheme: 'dark',
      }

    case 'SET_LIGHT':
      return {
        ...state,
        colorScheme: 'light',
      }
    default:
      return state
  }
}
