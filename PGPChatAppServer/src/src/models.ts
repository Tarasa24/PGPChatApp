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
      type: DataTypes.STRING,
      primaryKey: true,
    },
    timestamp: DataTypes.DATE,
    message_content: DataTypes.STRING,
    message_signature: DataTypes.STRING,
    to: DataTypes.STRING,
    from: DataTypes.STRING,
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
    type: DataTypes.STRING,
    primaryKey: true,
  },
  publicKey: DataTypes.STRING,
  nonce: DataTypes.INTEGER,
})

export type KeyServerEntryType = {
  id: string
  publicKey: string
  nonce: number
}

export const MessageUpdateQueue = sequelize.define(
  'MessageUpdateQueue',
  {
    messageId: DataTypes.STRING,
    action: DataTypes.STRING,
    to: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
)
