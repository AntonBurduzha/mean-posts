const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
        email: req.body.email,
        password: hash
    });
    await user.save();
    res.status(201).json({ message: 'success' });
});

router.post('/login', async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(401).json({ message: 'fail' });
    }
    const comparedPassword = await bcrypt.compare(req.body.password, user.password);
    if (!comparedPassword) {
        res.status(401).json({ message: 'fail' });
    }
    const token = jwt.sign(
        { email: user.email, userId: user._id },
        'supa_pupa_secret',
        { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'success', token });
});

module.exports = router;
