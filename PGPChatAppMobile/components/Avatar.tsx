import React, { useEffect, useState } from 'react'
import { Image, ActivityIndicator } from 'react-native'
import { getRepository } from 'typeorm'
import { File } from '../assets/ts/orm'
import Svg, { Circle, Text } from 'react-native-svg'
import { useTheme } from './ThemeContext'
import { lightenDarkenColor } from '../assets/ts/lightenDarkenColor'
import { connect } from 'react-redux'
import * as RNFS from 'react-native-fs'

interface Props {
  userID: string
  size: number
  userAvatars: Map<string, string>
}

function Avatar(props: Props) {
  const theme = useTheme()

  enum StatusEnum {
    Loading = 0,
    Image = 1,
    Svg = 2,
  }

  interface Status {
    status: StatusEnum
    picture?: File & { b64: string }
  }

  const [status, setStatus] = useState({ status: StatusEnum.Loading } as Status)

  useEffect(
    () => {
      async function main() {
        const fileID = props.userAvatars[props.userID]

        if (fileID) {
          const fileRepository = getRepository(File)
          const picture = await fileRepository.findOneOrFail({ id: fileID })

          setStatus({
            status: StatusEnum.Image,
            picture: {
              ...picture,
              b64: await RNFS.readFile(picture.uri, 'base64'),
            },
          })
        } else setStatus({ status: StatusEnum.Svg })
      }

      main()
    },
    [props.userAvatars]
  )

  function evalState() {
    if (status.status === StatusEnum.Image)
      return (
        <Image
          style={{ width: props.size, height: props.size, borderRadius: 100 }}
          source={{
            uri: `data:${status.picture.mime};base64,${status.picture.b64}`,
          }}
        />
      )
    else if (status.status === StatusEnum.Svg)
      return (
        <Svg height={props.size} width={props.size}>
          <Circle
            fill={lightenDarkenColor(theme.colors.primary, -50)}
            r="50%"
            cx={props.size / 2}
            cy={props.size / 2}
          />
          <Text
            fill="white"
            fontFamily="Monospace"
            fontSize={props.size / 2}
            x={props.size / 2}
            y={props.size / 1.5}
            textAnchor="middle"
          >
            {props.userID ? props.userID[0] : '?'}
          </Text>
        </Svg>
      )
    else return <ActivityIndicator size="large" color={theme.colors.primary} />
  }

  return evalState()
}

const mapStateToProps = (state: any) => ({
  userAvatars: state.userAvatarsReducer,
})

const mapDispatchToProps = (dispatch: any) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Avatar)
