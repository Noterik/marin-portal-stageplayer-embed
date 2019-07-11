const path = require('path');
const fs = require('fs').promises;
const R = require('ramda');
const createStageHandler = require('insync-stage-handler');
const options = require('./options');
const { getSettings } = require('./settings');
const { LOGGER } = require('./logger');

const handler = createStageHandler();

const { assetRoot } = options;

const readStage = file => fs.readFile(path.resolve(assetRoot, file), 'utf-8')
  .then(JSON.parse);

const getStage = p => Promise.all([
  readStage(p),
  getSettings(p),
]).then(([stage, settings]) => {
  return R.pipe(
    R.mergeLeft(settings),
    R.assocPath(['menu', 'visible'], false),
    R.assocPath(['annotations', 'allowed'], false),
    R.assoc('data', R.prop('data', settings)),
    R.assocPath(['data', 'measurementScale'], R.path(['data', 'measurementScale'], stage)),
    R.assocPath(['timeline', 'entities', 'comments'], R.path(['timeline', 'entities', 'comments'], stage)),
    handler,
    R.prop('stage'),
    R.tap((mergedStage) => { LOGGER.debug('merged stage = ', mergedStage); }),
  )(stage);
});

module.exports = {
  getStage,
};
