const jwt = require('jsonwebtoken');
const {roles} = require('./roles')

function auth(req, res, next) {
    // check for authorisation token
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied');

    try {
        const decodedPayload = jwt.verify(token, process.env.TRAIL_JWT_PRIVATE_KEY);
        req.user = decodedPayload;
        next();
    } catch(ex) {
        res.status(400).send('Invalid token');
    }
}

function checkPermissionTo(action, resource) {
    // check for user permission
    return (req, res, next) => {
        const permission = roles.can(req.user.role)[action](resource);
        if(!permission.granted) return res.status(403).send(`You don't have the required permission`);
        next();
    }
}

module.exports.auth = auth;
module.exports.checkPermissionTo = checkPermissionTo;
