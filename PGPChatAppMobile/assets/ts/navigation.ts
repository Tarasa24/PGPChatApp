import { NavigationContainerRef } from '@react-navigation/native'
import * as React from 'react'

export const navigationRef = React.createRef() as React.Ref<
  NavigationContainerRef
>

export function navigate(name, params) {
  // @ts-expect-error
  navigationRef.current.navigate(name, params)
}

export function getCurrentRoute(): { name: string } {
  // @ts-expect-error
  return navigationRef.current.getCurrentRoute()
}

export function goBack() {
  // @ts-expect-error
  navigationRef.current.goBack()
}
