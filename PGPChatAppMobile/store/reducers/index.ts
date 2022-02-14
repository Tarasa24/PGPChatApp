// Imports: Dependencies
import { combineReducers } from 'redux'
// Imports: Reducers
import colorSchemeReducer from './colorSchemeReducer'
import localUserReducer from './localUserReducer'
import userAvatarsReducer from './userAvatarsReducer'
import messageUpdatesListReducer from './messageUpdatesListReducer'
import socketConnectedReducer from './socketConnectedReducer'
import userNamesReducer from './userNamesReducer'

// Redux: Root Reducer
const rootReducer = combineReducers({
  colorSchemeReducer,
  localUserReducer,
  userAvatarsReducer,
  messageUpdatesListReducer,
  socketConnectedReducer,
  userNamesReducer,
})
// Exports
export default rootReducer
