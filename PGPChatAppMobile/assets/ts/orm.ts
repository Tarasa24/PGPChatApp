import 'reflect-metadata'

import {
  Column,
  createConnection,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import AddedHashToFiles1633013397001 from '../migrations/AddedHashToFiles1633013397001'

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column('text', { nullable: true })
  linkUri: string
  @Column('text') mime: string
  @Column('text') uri: string
  @Column('text') name: string
  @Column('text', {
    nullable: true,
    unique: true,
  })
  hash: string
  @Column('boolean', { nullable: true })
  renderable: boolean
  @ManyToOne(() => Message, (message) => message.files, { nullable: true })
  parentMessage: Message
}

@Entity()
export class User {
  @PrimaryColumn('text') id: string
  @Column('text', { nullable: true })
  name: string
  @OneToOne(() => File, { nullable: true, cascade: true, eager: true })
  @JoinColumn()
  picture: File
  @Column('text') publicKey: string
}

export enum MessageStatus {
  sending,
  sent,
  recieved,
  read,
  deleted,
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column('integer') timestamp: number
  @OneToOne(() => Message, { nullable: true })
  @JoinColumn()
  parentMessage: Message
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  author: User
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  recipient: User
  @OneToMany(() => File, (file) => file.parentMessage)
  @JoinColumn()
  files: File[]
  @Column('text') text: string
  @Column('integer', { default: MessageStatus.sending })
  status: MessageStatus
}

export interface MessageRaw {
  id: string
  timestamp: number
  text: string
  author: string
  status: MessageStatus
  files: File[]
}

export interface sendMessageContent {
  text?: string
  files?: {
    linkUri?: string
    base64?: string
    name: string
    mime: string
    renderable: boolean
  }[]
}

let connExists = false
export function connect() {
  if (!connExists) {
    connExists = true
    return createConnection({
      type: 'react-native',
      database: 'db',
      location: 'default',
      logging: ['error'],
      entities: [File, User, Message],
      migrations: [AddedHashToFiles1633013397001],
    })
  } else return new Promise(() => {})
}
