const Joi = require('@hapi/joi');

function validateAuthData(clientData) {
    const authDataSchema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    })
    return authDataSchema.validate(clientData);
}

module.exports.validateAuthData = validateAuthData;