const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'supa_pupa_secret');
        next();
    } catch (err) {
        res.status(401).json({ message: 'fail' });
    }
};
