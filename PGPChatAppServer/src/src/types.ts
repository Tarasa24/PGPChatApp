export type UserID = string
export type SocketID = string

export type UserSocket = {
  [userID: string]: UserID
}

export type SocketUser = {
  [socketID: string]: SocketID
}

export type LoginPayload = {
  userID: UserID
  signature: string
}

export type Message = {
  content: string
  signature: string
}

export type SendPayload = {
  id: string
  timestamp: Date | number
  message: Message
  from: UserID
  to: UserID
}

export type MessageUpdatePayload = {
  to: UserID
  from: UserID
  messageId: string
  action: 'SET_STATUS_SENT' | 'SET_STATUS_RECIEVED' | 'SET_STATUS_READ' | 'DELETE'
  timestamp: number
}

export type CallPayload = {
  caller: string
  callerPeerToken: string
  callee: string
  calleePeerToken: string
}
