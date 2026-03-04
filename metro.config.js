const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
  svgrOptions: {
    // Replace hardcoded black fills with currentColor so SVGs can be tinted via the color prop
    replaceAttrValues: { '#000': 'currentColor', '#000000': 'currentColor', 'black': 'currentColor' },
    svgoConfig: {
      plugins: [
        { name: 'inlineStyles', params: { onlyMatchedOnce: false, removeMatchedSelectors: true, useMqs: [] } },
      ],
    },
  },
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: "./global.css" });
