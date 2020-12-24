const Joi = require('@hapi/joi');

const verifyPaymentDetails = (paymentDetails) => {
    const paymentDataSchema = Joi.object({
       userId: Joi.objectId().required(),
       energyBought: Joi.number().required(),
       subscriptionPlan: Joi.string().min(3).max(50).required(),
       reference: Joi.required()
    })

    return paymentDataSchema.validate(paymentDetails);
}

module.exports.verifyPaymentDetails = verifyPaymentDetails;