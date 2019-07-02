const minimist = require('minimist');
const path = require('path');

const args = minimist(process.argv.slice(2), {
  alias: {
    p: 'port',
    l: 'log',
    logLevel: 'log-level',
    assetRoot: 'asset-root',
    root: 'root',
  },
});

const {
  port = 3000, host = 'localhost', log = undefined, logLevel = 'info', assetRoot = './',
} = args;

const root = path.resolve(__dirname, '..');

module.exports = Object.freeze({
  port,
  host,
  log,
  logLevel,
  assetRoot: path.resolve(root, assetRoot),
});
