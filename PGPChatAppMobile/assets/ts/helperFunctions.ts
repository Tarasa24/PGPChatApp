import { Platform, NativeModules } from 'react-native'

export function timeHandler(timestamp: number) {
  const diff = Math.round((Date.now() - timestamp) / 1000)

  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier

  if (diff < 60) return 'Now'
  else if (diff < 60 * 60) return Math.round(diff / 60) + ' m'
  else if (diff < 60 * 60 * 24) return Math.round(diff / (60 * 60)) + ' h'
  else if (diff < 60 * 60 * 24 * 30)
    return Math.round(diff / (60 * 60 * 24)) + ' d'
  else return new Date(timestamp).toLocaleDateString(locale)
}
