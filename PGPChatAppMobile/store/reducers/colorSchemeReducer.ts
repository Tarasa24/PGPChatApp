import { Appearance } from 'react-native-appearance'
import { Action } from 'redux'

const initialState = {
  colorScheme:
    Appearance.getColorScheme() === 'no-preference'
      ? 'light'
      : Appearance.getColorScheme(),
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
