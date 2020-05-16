const express = require('express');
const router = express.Router();
const checkAuthentication = require('../middleware/auth');

router.get('/dashboard', checkAuthentication, (req, res) => {
    res.render('dashboard', { user: req.user });
});

module.exports = router;