module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated のプラグインは必ずリストの最後に置くこと
      'react-native-reanimated/plugin',
    ],
  };
};
