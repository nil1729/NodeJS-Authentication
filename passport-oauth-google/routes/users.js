const express = require('express');
const router = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const passport = require('passport');

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google'),
  function(req, res) {
       res.redirect('/secret');
});

router.get('/secret', checkAuthentication, (req, res) => {
     res.json({
         user: req.user
     });
});

module.exports = router;
