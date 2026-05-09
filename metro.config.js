const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable strict package exports to allow resolution of internal files
config.resolver.unstable_enablePackageExports = false;

module.exports = config;