import * as React from 'react'
import Svg, { SvgProps, Path } from 'react-native-svg'

function SvgComponent(props: SvgProps) {
  return (
    <Svg width={1920} height={244} fill="none" {...props}>
      <Path
        d="M-789 6.17h64.527c64.527 0 193.204 0 323.011 7.316 128.489 7.868 257.731 21.671 385.656 73.71C114 138.682 243.806 227.023 371.73 241.793c129.242 14.217 257.732-43.757 387.538-73.71 128.677-29.401 257.731-29.401 387.541-29.401 128.11 0 257.73 0 385.65-14.769 129.62-14.218 257.73-44.585 323.58-58.802L1920 50.34V0H-789v6.17z"
        fill="#512DA8"
        fillOpacity={0.75}
      />
      <Path
        d="M0 91.64l43.646 7.662c43.646 7.374 130.937 23.125 218.229 38.159 87.292 15.035 174.583 30.786 261.875 19.116 87.292-11.24 174.583-49.901 261.875-42.026 87.292 7.876 174.583 60.855 261.875 57.276 87.29-3.58 174.58-65.151 261.88-87.847 87.29-23.125 174.58-7.374 261.87-3.794 87.29 3.58 174.58-3.58 261.88-15.25 87.29-11.24 174.58-26.99 218.22-34.365l43.65-7.66V0H0v91.64z"
        fill="#512DA8"
      />
    </Svg>
  )
}

export default SvgComponent
