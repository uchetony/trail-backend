const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const endpoint = express.Router();

const {validateAuthData} = require('./model');
const {User} = require('../users/model');
const {Stakeholder} = require('../stakeholders/model');

// sigin a user
endpoint.post('/', async (req, res) => {
    // validate client data
    const clientData = _.pick(req.body, ['email', 'password'])
    const {error} = validateAuthData(clientData);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exists
    let user = await User.findOne(_.pick(req.body, 'email'));
    let stakeholder = await Stakeholder.findOne(_.pick(req.body, 'email'));


    if(!user && !stakeholder) return res.status(400).send('Invalid email or passwords');

    // check if password in db match that of client
    const passwordIsValid = user ? 
        await bcrypt.compare(req.body.password, user.password) :
        await bcrypt.compare(req.body.password, stakeholder.password)

    if (!passwordIsValid) return res.status(400).send('Invalid email or password');

    // create a jwt, send response to client
    const token = user ? user.generateAuthToken() : stakeholder.generateAuthToken();
    res.send({token}).end();
})

module.exports = endpoint;