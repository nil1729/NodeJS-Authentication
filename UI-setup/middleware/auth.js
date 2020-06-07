module.exports = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('error', 'You Have to First Login to view Dashboard');
        res.redirect('/users/login');
    }
};