const path = require('path');
const fs = require('fs').promises;
const { LOGGER } = require('./logger');

const tap = cb => (a) => {
  cb(a);
  return a;
};

const findSettingsInFolder = (p) => {
  LOGGER.debug(`Scanning for settings in ${p}.`);
  return fs
    .readdir(p)
    .then((files) => {
      return files.find(
        f => !f.startsWith('._') && f.endsWith('.stagesettings'),
      );
    })
    .then(result => (result ? path.resolve(p, result) : undefined));
};

const findSettingsFor = (p) => {
  LOGGER.debug(`Finding settings in "${p}".`);
  const pathParts = p
    .split(path.sep)
    .slice(0, -1);

  const paths = pathParts
    .reduce((acc, curr, i) => [...acc, pathParts.slice(0, i + 1).join(path.sep)], [])
    .reverse();

  console.log('paths = ', paths);

  LOGGER.debug(`Scanning paths [${paths}] in that order until one is found.`);

  return paths
    .reduce((result, part) => {
      return result.then((settings) => {
        if (!settings) {
          return findSettingsInFolder(part);
        }
        return Promise.resolve(path.resolve(part, settings));
      });
    }, Promise.resolve());
};

const loadSettings = p => fs.readFile(p).then(JSON.parse);

const getSettings = p => findSettingsFor(p)
  .then(tap((settings) => {
    LOGGER.info(`Found settings at: "${settings}".`);
  }))
  .then(loadSettings);

module.exports = {
  getSettings,
};
