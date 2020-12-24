require('dotenv').config();
require('express-async-errors');
const {serverError} = require('./middlewares/errors');
const {logger} = require('./startup/logger');
const express = require('express');
const app = express();


const port = process.env.PORT || 5000;

// server startup requirements
require('./startup/cors')(app);
require('./startup/db')();
require('./startup/validateObjectId')();
require('./startup/endpoints')(app);
require('./startup/prod')(app);

app.use(serverError);

app.listen(port, () => logger.info(`server started on port: ${port}`));