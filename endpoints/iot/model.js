const Joi = require('@hapi/joi');

function validateRegistryDetails(registryData) {
    const registryDataSchema = Joi.object({
        registryId: Joi.string().min(3).max(255).required(),
    })

    return registryDataSchema.validate(registryData);
}

module.exports.validateRegistryDetails = validateRegistryDetails;