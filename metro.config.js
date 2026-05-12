const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const path = require('path');

// Disable strict package exports to allow resolution of internal files
config.resolver.unstable_enablePackageExports = false;
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    'react-async-hook': path.resolve(__dirname, 'stubs/react-async-hook.js'),
};

module.exports = config;