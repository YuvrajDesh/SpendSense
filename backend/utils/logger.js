const winston = require('winston');
const LogstashTransport = require('winston3-logstash-transport');

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
    ]
});

// Only add Logstash transport if host is configured
if (process.env.LOGSTASH_HOST) {
    logger.add(new LogstashTransport({
        mode: 'tcp',
        host: process.env.LOGSTASH_HOST,
        port: process.env.LOGSTASH_PORT || 5044
    }));
}

module.exports = logger;