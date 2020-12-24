const express = require('express');
const usersEndpoint = require('../endpoints/users');
const authEndpoint = require('../endpoints/auth');
const iotEndpoint = require('../endpoints/iot');
const paymentEndpoint = require('../endpoints/payments');
const stakeholderEndpoint = require('../endpoints/stakeholders')

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/users', usersEndpoint);
    app.use('/api/auth', authEndpoint);
    app.use('/api/iot', iotEndpoint);
    app.use('/api/payments', paymentEndpoint);
    app.use('/api/stakeholders', stakeholderEndpoint);
}