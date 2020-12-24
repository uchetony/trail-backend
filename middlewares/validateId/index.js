const mongoose = require('mongoose');

function validObjectId(id) {
    return console.log(mongoose.Types.ObjectId.isValid(id))
}

const isValid = validObjectId(1234);
console.log(isValid)

module.exports.validObjectId = validObjectId;