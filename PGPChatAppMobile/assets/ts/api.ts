import DeviceInfo from 'react-native-device-info'
import RNFetchBlob, { FetchBlobResponse, StatefulPromise } from 'rn-fetch-blob'

const prefixPath = __DEV__
  ? DeviceInfo.isEmulatorSync()
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000'
  : 'https://chatapp.tarasa24.dev/app-api'

export function fetchRest(
  url: string,
  method: 'POST' | 'GET' | 'DELETE' | 'PUT' = 'GET',
  body: object = {}
): StatefulPromise<FetchBlobResponse> {
  return RNFetchBlob.config({ trusty: true }).fetch(
    method,
    prefixPath + url,
    { 'Content-Type': 'application/json' },
    JSON.stringify(body)
  )
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
