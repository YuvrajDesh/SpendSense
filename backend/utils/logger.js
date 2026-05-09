const winston = require('winston');
const LogstashTransport = require('winston-logstash').Logstash;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new LogstashTransport({
            host: 'localhost',
            port: 5044
        })
    ]
});

module.exports = logger;