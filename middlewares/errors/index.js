const {logger} = require('../../startup/logger');

// handle errors that happen within the request processing pipeline
function serverError(err, req, res, next) {
    logger.error(err.message, err);
    res.status(500).send('Oops!, something happened on the server');
}

module.exports.serverError = serverError;