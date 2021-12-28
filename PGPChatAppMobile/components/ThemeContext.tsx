import * as React from 'react'
import { ColorSchemeName } from 'react-native-appearance'
import { lightTheme, darkTheme } from '../assets/ts/ColorThemes'
import { connect } from 'react-redux'

export const ThemeContext = React.createContext({
  dark: false,
  colors: lightTheme,
  toggleScheme: () => {},
})

const Component = (props: {
  children: React.ReactNode
  colorScheme: ColorSchemeName
}) => {
  /*
   * To enable changing the app theme dynamicly in the app (run-time)
   * we're gonna use useState so we can override the default device theme
   */
  const [dark, setdark] = React.useState(props.colorScheme === 'dark')

  // Listening to changes of device appearance while in run-time
  React.useEffect(() => setdark(props.colorScheme === 'dark'), [props.colorScheme])

  const defaultTheme = {
    dark,
    // Chaning color schemes according to theme
    colors: dark ? darkTheme : lightTheme,
    // Overrides the dark value will cause re-render inside the context.
    toggleScheme: () => (dark ? setdark(false) : setdark(true)),
  }

  return (
    <ThemeContext.Provider value={defaultTheme}>{props.children}</ThemeContext.Provider>
  )
}

const mapStateToProps = (state: {
  colorSchemeReducer: { colorScheme: ColorSchemeName }
}) => ({
  colorScheme: state.colorSchemeReducer.colorScheme,
})

export const ThemeProvider = connect(mapStateToProps, {})(Component)

// Custom hook to get the theme object returns {dark, colors, setScheme}
export const useTheme = () => React.useContext(ThemeContext)
