const winston = require("winston");
const options = require("./options");

const createLogger = ({ file = undefined, level = "info" }) => {
  const transports = [new winston.transports.Console({ level })];
  if (file) {
    transports.push(new winston.transports.File({ filename: file, level }));
  }
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: "stageplayer-portal-embed" },
    transports
  });
};

const LOGGER = createLogger({ file: options.log, level: options.logLevel });

module.exports = {
  LOGGER,
  createLogger
};
