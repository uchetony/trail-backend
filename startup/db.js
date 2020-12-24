const mongoose = require('mongoose');
const {logger} = require('./logger');

module.exports = function() {
    const {TRAIL_DB_URI, TRAIL_DB_NAME} = process.env;

    // accomodate new version updates
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('useCreateIndex', true);

    mongoose.connect(`${TRAIL_DB_URI}`)
    .then(() => logger.info(`connected to ${TRAIL_DB_NAME} database`))
}