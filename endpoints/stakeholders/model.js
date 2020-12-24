const Joi = require("@hapi/joi");
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

function validateStakeholder(stakeholderData){
    
    const stakehoderDataSchema = Joi.object({
        companyName: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        role: Joi.string().min(5).max(50).required()
    })
    return stakehoderDataSchema.validate(stakeholderData);
}

const stakeholderSchema = new mongoose.Schema({
    companyName: { type: String, required: true, minlength: 5, maxlength: 50 },
    email: { type: String, required: true, minlength: 5, maxlength: 255, unique: true },
    password: { type: String, required: true, minlength: 5, maxlength: 1024 },
    role: { type: String, required: true, default: 'customer', enum: ['customer', 'stakeholder', 'super-admin'] },
})

stakeholderSchema.methods.generateAuthToken = function() {
    const privateKey = process.env.TRAIL_JWT_PRIVATE_KEY;
    const token = jwt.sign({
        _id: this._id, 
        role: this.role,
        companyName: this.companyName,
        email: this.email,
    }, privateKey)
    return token;
}

const Stakeholder = mongoose.model('Stakeholder', stakeholderSchema);

module.exports.Stakeholder = Stakeholder;
module.exports.validateStakeholder = validateStakeholder;
