import 'reflect-metadata'

import { MimeType } from 'react-native-document-picker'
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

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column('text', { nullable: true })
  linkUri: string
  @Column('text') mime: MimeType
  @Column('text') uri: string
  @Column('text') name: string
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
    mime: MimeType
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
      migrations: [],
    })
  } else return new Promise(() => {})
}
