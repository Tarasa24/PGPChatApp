import DeviceInfo from 'react-native-device-info'

// TODO: Add production url
const prefixPath = __DEV__
  ? DeviceInfo.isEmulatorSync()
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000'
  : 'https://chatapp.tarasa24.dev/app-api'

export function fetchRest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout'))
    }, 5000)

    fetch(prefixPath + url, options)
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((reason) => {
        clearTimeout(timer)
        reject(reason)
      })
  })
}

export function ping(): Promise<number> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout'))
    }, 5000)

    const latencyStart = Date.now()
    fetch(prefixPath + '/ping')
      .then((value) => {
        clearTimeout(timer)
        resolve(Date.now() - latencyStart)
      })
      .catch((reason) => {
        clearTimeout(timer)
        reject(reason)
      })
  })
}
