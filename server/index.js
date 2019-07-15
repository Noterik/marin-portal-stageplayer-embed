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

app.get(`/(/)?${constants.STAGE_ENDPOINT}`, (req, res) => {
  LOGGER.info('Request.', req);
  getStage(req.query.file).then(stage => res.json(stage));
});

app.use(
  '/(/)?lib',
  express.static(path.resolve(__dirname, '../node_modules/insync-stageplayer/dist/online')),
);
app.use(`(/)?${options.assetRoot}`, express.static(options.assetRoot));

const regexMatch = pattern => pathname => pathname.match(pattern);
app.use(
  proxy(regexMatch('/(/)?lib'), {
    target: options.libServer,
    pathRewrite: {
      '^/(/)?lib': '',
    },
  }),
);
app.use(proxy(regexMatch(`/(/)?${constants.DATA_ENDPOINT}`), { target: options.dataServer }));
app.use(
  proxy(regexMatch(`/(/)?${constants.SBF_DATA_ENDPOINT}`), { target: options.sbfDataServer }),
);

if (process.env.NODE_ENV !== 'production') {
  LOGGER.debug('Serving through webpack dev server.');
  app.use('/', proxy(`http://localhost:${constants.CLIENT_PORT}`));
} else {
  const publicDir = path.resolve(__dirname, '../client/public/');
  LOGGER.debug(`Serving static files from ${publicDir}.`);
  app.use(express.static(publicDir));
}

app.listen(options.port, options.host, () => {
  LOGGER.info(`listening on ${options.host}:${options.port}.`);
});
