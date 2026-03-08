const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Adds CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES to all pod targets.
 * Required for @react-native-firebase to compile with useFrameworks: static.
 */
module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile')
      let contents = fs.readFileSync(podfilePath, 'utf8')

      const injection = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end`

      contents = contents.replace(
        /post_install do \|installer\|/,
        `post_install do |installer|${injection}`
      )

      fs.writeFileSync(podfilePath, contents)
      return config
    },
  ])
