const minimist = require('minimist');
const path = require('path');

const args = minimist(process.argv.slice(2), {
  alias: {
    p: 'port',
    l: 'log',
    logLevel: 'log-level',
    assetRoot: 'asset-root',
    root: 'root',
    dataServer: 'data-server',
    sbfDataServer: 'sbf-data-server',
    stageplayerServer: 'stageplayer-server',
  },
});

const {
  port = 8080,
  host = 'localhost',
  log = undefined,
  logLevel = 'info',
  assetRoot = './',
  dataServer = 'http://localhost',
  sbfDataServer = 'http://localhost',
  stageplayerServer = 'http://localhost',
} = args;

const root = path.resolve(__dirname, '..');

module.exports = Object.freeze({
  port,
  host,
  log,
  logLevel,
  assetRoot: path.resolve(root, assetRoot),
  dataServer,
  sbfDataServer,
  stageplayerServer,
});
