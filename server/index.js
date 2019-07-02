const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { getStage } = require('./stage');
const { LOGGER } = require('./logger');
const options = require('./options');

LOGGER.debug(`Root = ${__dirname}`);
LOGGER.debug('Start with options.', options);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/stage', (req, res) => {
  LOGGER.info('Request.', req);
  getStage(req.query.file)
    .then(stage => res.json(stage));
});

app.use(express.static(path.resolve(__dirname, '../public')));

app.listen(options.port, options.host, () => {
  LOGGER.info(`listening on ${options.host}:${options.port}.`);
});
