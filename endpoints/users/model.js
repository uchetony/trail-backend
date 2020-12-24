const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');

// validate client data
function validateUser(clientData) {
    const userDataSchema = Joi.object({
        fullName: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        address: Joi.string().min(5).max(255).required(),
        phoneNumber: Joi.string().min(11).max(11).required(),
        role: Joi.string().min(5).max(50).required()
    })
    return userDataSchema.validate(clientData);
}

function validateBillingData(billingData) {
    const billingDataSchema = Joi.object({
        userId: Joi.objectId().required(),
        meterId: Joi.objectId().required(),
        companyId: Joi.objectId().required(),
        companyName: Joi.string().min(5).max(50).required()
    })
    return billingDataSchema.validate(billingData)
}

// validateOjectId from client
function validateObjectId(clientId) {
    const idSchema = Joi.object({
        userId: Joi.objectId(),
        companyId: Joi.objectId()
    })
    return idSchema.validate(clientId);
}

// validate data going to db
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, minlength: 5, maxlength: 50 },
    email: { type: String, required: true, minlength: 5, maxlength: 255, unique: true },
    password: { type: String, required: true, minlength: 5, maxlength: 1024 },
    role: { type: String, required: true, default: 'customer', enum: ['customer', 'stakeholder', 'super-admin'] },
    phoneNumber: {type: String, required: true, minlength: 11, maxlength: 11},
    address: {type: String, required: true, minlength: 5, maxlength: 255},
    isVerifiedEmail: { type: Boolean, required: true, default: false },
    billingDetails: {
        meterId: { type: String, default: null, minlength: 5, maxlength: 255},
        disco: {
            id: {type: String, default: null, minlength: 5, maxlength: 255},
            name: { type: String, default: null , minlength: 5, maxlength: 50 } 
        },
        currentPlan: { type: String, default: null, minlength: 5, maxlength: 255},
        energyBalance: { type: Number, default: null}
    }
})

userSchema.methods.generateAuthToken = function() {
    const privateKey = process.env.TRAIL_JWT_PRIVATE_KEY
    const token = jwt.sign({ 
        _id: this._id, 
        role: this.role,
        fullName: this.fullName,
        phoneNumber: this.phoneNumber,
        email: this.email,
        isVerifiedEmail: this.isVerifiedEmail,
        address: this.address,
        billingDetails: {
            meterId: this.billingDetails.meterId,
            disco: {
                id: this.billingDetails.disco.id,
                name: this.billingDetails.disco.name
            },
            currentPlan: this.billingDetails.currentPlan,
            energyBalance: this.billingDetails.energyBalance
        }
    }, privateKey);
    return token;
}

const User = mongoose.model('User', userSchema);

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.validateObjectId = validateObjectId;
module.exports.validateBillingData = validateBillingData;