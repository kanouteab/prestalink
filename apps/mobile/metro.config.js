// Configuration standard Expo pour un monorepo (npm workspaces) :
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// La recherche hierarchique standard reste active (contrairement au guide Expo
// par defaut) : avec npm workspaces certaines dependances transitives d'`expo`
// (ex. expo-asset) restent nichees sous node_modules/expo/node_modules et ne
// sont retrouvees que par cette recherche montante.

module.exports = config;
