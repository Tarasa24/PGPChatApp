import React, { useEffect, useState } from 'react'
import { View, Text, Platform, NativeModules } from 'react-native'

export default function Time(props: { timestamp: number; style: any }) {
  function timeHandler(timestamp: number) {
    let diff = Math.round((Date.now() - Number(new Date(timestamp))) / 1000)

    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale
        : NativeModules.I18nManager.localeIdentifier

    if (diff < 60) return 'Now'
    else if (diff < 60 * 60) return Math.round(diff / 60) + ' m'
    else if (diff < 60 * 60 * 24) return Math.round(diff / (60 * 60)) + ' h'
    else if (diff < 60 * 60 * 24 * 30) return Math.round(diff / (60 * 60 * 24)) + ' d'
    else return new Date(timestamp).toLocaleDateString(locale)
  }

  const [tick, setTick] = useState(timeHandler(props.timestamp))

  useEffect(() => {
    const interval = setInterval(() => {
      const formatted = timeHandler(props.timestamp)
      if (formatted !== tick) setTick(formatted)
    }, 60 * 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return <Text style={props.style}>{tick}</Text>
}
