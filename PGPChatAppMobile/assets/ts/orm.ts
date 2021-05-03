import 'reflect-metadata'

import { MimeType } from 'react-native-document-picker'
import {
  Column,
  createConnection,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column('text') name: string
  @Column('text') mime: MimeType
  @Column('integer') size: number
  @Column('text') b64: string
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
  @OneToOne(() => File, { nullable: true, cascade: true, eager: true })
  @JoinColumn()
  file: File
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
      synchronize: true,
      entities: [File, User, Message],
    })
  } else return new Promise(() => {})
}
