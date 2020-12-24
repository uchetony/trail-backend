const AccessControl = require('accesscontrol');
const ac = new AccessControl();

function roles() {
    ac.grant('customer')
        .readOwn('user')
        .createOwn('device')

    ac.grant('stakeholder')
        .extend('customer')
        .readAny('user')
        .createAny('registry')
        .createAny('device')
        .readAny('registry')

    ac.grant('super-admin')
        .extend('stakeholder');

    return ac;
}

module.exports.roles = roles();