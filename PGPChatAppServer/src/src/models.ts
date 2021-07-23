import seq from 'sequelize'

const { Sequelize, DataTypes } = seq

export const sequelize =
  process.env.NODE_ENV === 'production'
    ? new Sequelize({
        dialect: 'mysql',
        host: 'mysql.mysql.svc.cluster.local',
        username: process.env.mysqlUser,
        password: process.env.mysqlPass,
        database: 'chatapp',
        logging: false,
      })
    : new Sequelize({
        dialect: 'sqlite',
        storage: './db.sqlite',
      })

export const MessagesQueue = sequelize.define(
  'MessagesQueue',
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    timestamp: DataTypes.DATE,
    message_content: DataTypes.TEXT,
    message_signature: DataTypes.TEXT,
    to: DataTypes.STRING(28),
    from: DataTypes.STRING(28),
  },
  {
    freezeTableName: true,
  }
)
export type MessagesQueueType = {
  id: string
  timestamp: number
  message_content: string
  message_signature: string
  to: string
  from: string
}

export const KeyServerEntry = sequelize.define('KeyServerEntry', {
  id: {
    type: DataTypes.STRING(28),
    primaryKey: true,
  },
  publicKey: DataTypes.TEXT,
  nonce: DataTypes.INTEGER,
  notificationToken: DataTypes.STRING,
})

export type KeyServerEntryType = {
  id: string
  publicKey: string
  nonce: number
  notificationToken: string
}

export const MessageUpdateQueue = sequelize.define(
  'MessageUpdateQueue',
  {
    messageId: DataTypes.STRING(36),
    action: DataTypes.STRING,
    to: DataTypes.STRING(28),
  },
  {
    freezeTableName: true,
  }
)
