const {createLogger, format, transports} = require('winston');
const { timestamp, combine, colorize, simple } = format

const logger = createLogger({
    format: combine(timestamp(), simple(), colorize()),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({ filename: 'logfile.log' }),
        new transports.Console({ format: combine(simple(), colorize()) }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'uncaughtExceptions.log' }),
        new transports.Console({ format: combine(simple(), colorize()) }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'unhandledRejections.log' }),
        new transports.Console({ format: combine(simple(), colorize()) }),
    ]
})

module.exports.logger = logger;