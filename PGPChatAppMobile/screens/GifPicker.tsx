import React, { useEffect, useState } from 'react'
import * as RNGS from 'react-native-gif-search'
import { useTheme } from '../components/ThemeContext'
import { connect } from 'react-redux'
import { InlineFile } from './Chat'
import * as pickedGifReducer from '../store/reducers/pickedGifReducer'
import { MimeType } from 'react-native-document-picker'
import RNFetchBlob from 'rn-fetch-blob'
import { useNavigation } from '@react-navigation/native'

function GifPicker(props: {
  setPickedGif: (file: InlineFile) => void
  dropPickedGif: () => void
}) {
  const theme = useTheme()
  const navigation = useNavigation()

  useEffect(() => {
    props.dropPickedGif()
  }, [])

  return (
    <RNGS.GifSearch
      giphyApiKey="DdxRaoNeGEsvnhOajVeC1MQGaAZTCYd9"
      onGifSelected={async (url, obj) => {
        const res = await RNFetchBlob.config({ fileCache: true }).fetch('GET', url)

        const b64 = await res.readFile('base64')

        props.setPickedGif({
          renderable: true,
          mime: 'image/gif' as MimeType,
          b64: b64,
          name: 'GIF.gif',
          uri: res.path(),
          linkUri: url,
        })
        navigation.goBack()
      }}
      style={{ backgroundColor: theme.colors.background }}
      textInputStyle={{ fontWeight: 'bold', color: theme.colors.text }}
      loadingSpinnerColor={theme.colors.primary}
      placeholderTextColor={'grey'}
      noGifsFoundText={'No gifs found :('}
      horizontal={false}
    />
  )
}

const mapStateToProps = (state: any) => ({})

const mapDispatchToProps = (dispatch: any) => ({
  setPickedGif: (file: InlineFile) => {
    dispatch({
      type: 'SET_PICKED_GIF',
      payload: file,
    } as pickedGifReducer.Action)
  },
  dropPickedGif: () => {
    dispatch({
      type: 'DROP_PICKED_GIF',
      payload: {},
    } as pickedGifReducer.Action)
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(GifPicker)
