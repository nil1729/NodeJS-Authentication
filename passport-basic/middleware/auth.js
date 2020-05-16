module.exports = function(req, res, next) {
	console.log(req);
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('e_m', 'You Have to First Logged In for this');
        res.redirect('/users/login');
    }
};