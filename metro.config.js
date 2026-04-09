const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Supabase's realtime-js has an issue resolving lib/websocket-factory in some environments.
// This configuration ensures that the bundler prioritizes correct extensions.
config.resolver.sourceExts.push('mjs');

module.exports = config;
