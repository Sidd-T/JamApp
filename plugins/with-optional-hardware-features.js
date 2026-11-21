const { withAndroidManifest } = require('@expo/config-plugins');

const OPTIONAL_FEATURES = [
  'android.hardware.screen.portrait',
  'android.hardware.wifi',
];

function withOptionalHardwareFeatures(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] ?? [];

    for (const name of OPTIONAL_FEATURES) {
      const feature = manifest['uses-feature'].find(
        item => item.$?.['android:name'] === name,
      );

      if (feature) {
        feature.$['android:required'] = 'false';
      }
      else {
        manifest['uses-feature'].push({
          $: {
            'android:name': name,
            'android:required': 'false',
          },
        });
      }
    }

    return config;
  });
}

module.exports = withOptionalHardwareFeatures;
