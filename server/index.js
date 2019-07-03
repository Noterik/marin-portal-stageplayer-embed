const express = require('express');
const proxy = require('http-proxy-middleware');

const path = require('path');
const bodyParser = require('body-parser');
const { getStage } = require('./stage');
const { LOGGER } = require('./logger');
const options = require('./options');
const constants = require('../constants.js');

LOGGER.debug('Start with options.', options);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/stage', (req, res) => {
  LOGGER.info('Request.', req);
  getStage(req.query.file)
    .then(stage => res.json(stage));
});

const stageplayerProxyOptions = {
  target: options.stageplayerServer,
  pathRewrite: {
    [`^${constants.STAGEPLAYER_ENDPOINT}`]: '',
  },
};
LOGGER.debug('Stageplayer proxy options = ', stageplayerProxyOptions);

app.use(proxy(constants.DATA_ENDPOINT, { target: options.dataServer }));
app.use(proxy(constants.SBF_DATA_ENDPOINT, { target: options.sbfDataServer }));
app.use(proxy(`${constants.STAGEPLAYER_ENDPOINT}/*`, stageplayerProxyOptions));

if (process.env.NODE_ENV !== 'production') {
  LOGGER.debug('Serving through webpack dev server.');
  app.use('/', proxy(`http://localhost:${constants.CLIENT_PORT}`));
} else {
  const publicDir = path.resolve(__dirname, '../client/public/');
  LOGGER.debug(`Serving static files from ${publicDir}.`);
  app.use(express.static(publicDir));
}
app.use(express.static(options.assetRoot));


app.listen(options.port, options.host, () => {
  LOGGER.info(`listening on ${options.host}:${options.port}.`);
});
