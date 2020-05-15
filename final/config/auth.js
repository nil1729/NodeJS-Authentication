module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('error_msg', 'Please Login to View this resource');
            res.redirect('/users/login');
        }
    }
};