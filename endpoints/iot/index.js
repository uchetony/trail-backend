const express = require('express');
const endpoint = express.Router();
const iot = require('@google-cloud/iot');
const _ = require('lodash');

// authorisation
const {auth, checkPermissionTo} = require('../../middlewares/authorisation');
const {validateRegistryDetails} = require('./model')


// POST REQUEST

// create a registry
endpoint.post('/registry', [auth, checkPermissionTo('createAny', 'registry')], async (req, res) => {
    const registryData = _.pick(req.body, ['registryId']);
    const {error} = validateRegistryDetails(registryData);
    if(error) return res.status(400).send(error.details[0].message);

    // set up the client an create the registry
    const {TRAIL_IOT_PROJECT_ID, TRAIL_IOT_PUBSUB_TOPIC_ID, TRAIL_IOT_CLOUD_REGION } = process.env
    
    const iotClient = new iot.v1.DeviceManagerClient();
    const parent = iotClient.locationPath(TRAIL_IOT_PROJECT_ID, TRAIL_IOT_CLOUD_REGION);
    const topicPath = `projects/${TRAIL_IOT_PROJECT_ID}/topics/${TRAIL_IOT_PUBSUB_TOPIC_ID}`;

    console.log('Topic path: ',topicPath);
    const deviceRegistry = {
        eventNotificationConfigs: [{ pubsubTopicName: topicPath }],
        id: req.body.registryId
    }

    const request = { parent, deviceRegistry }

    const responses = await iotClient.createDeviceRegistry(request);
    res.send(responses[0]);
})

// create a device
endpoint.post('/registry/device', [auth, checkPermissionTo('createOwn', 'device')], async (req, res) => {

})


module.exports = endpoint;