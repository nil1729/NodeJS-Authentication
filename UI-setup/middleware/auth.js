module.exports = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log(req.user);
        req.flash('error', 'You Have to First Login to view Dashboard');
        res.redirect('/users/login');
    }
};