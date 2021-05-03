/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      ecma: 8,
      keep_classnames: true,
      keep_fnames: true,
      module: true,
      mangle: {
        module: true,
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  },
}
