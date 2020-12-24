const express = require('express');
const endpoint = express.Router();
const {Stakeholder, validateStakeholder} = require('./model');
const {User} = require('../users/model');
const _ = require('lodash');
const bcrypt = require('bcrypt');

endpoint.get('/', async(req, res) => {
    const stakeholder = await Stakeholder.find().select({_id: 1, companyName: 1});
    res.send(stakeholder)
})

endpoint.post('/', async(req, res) => {
    const stakeholderData = _.pick(req.body, ['companyName', 'email', 'password', 'role']);
    const {error} = validateStakeholder(stakeholderData);
    if(error) return res.status(400).send(error.details[0].message);

    let stakeholder = await Stakeholder.findOne(_.pick(req.body, 'email'));
    const user = await User.findOne(_.pick(req.body, 'email'))
    if (stakeholder || user) return res.status(400).send('A user with this email already exists');

    stakeholder = new Stakeholder(_.pick(req.body, ['companyName', 'email', 'password','role']))
    const salt = await bcrypt.genSalt(10);
    stakeholder.password = await bcrypt.hash(stakeholder.password, salt);
    await stakeholder.save();

    //  create a jwt, send response to client
    const token = stakeholder.generateAuthToken();
    res.header('x-auth-token', token).send({token, ..._.pick(stakeholder, ['_id', 'companyName', 'email'])});

})

module.exports = endpoint;