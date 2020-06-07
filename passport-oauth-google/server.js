const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');

// DB Connect
require('./config/db')();

// Passport Strategy
require('./config/passport')(passport);

// Express Session Setup
app.use(session({
    secret: 'Nilanjan',
    saveUninitialized: true,
    resave: true
}));

// Body Parser
app.use(express.json({extended: true}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());


// Server Port 
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port`);
});


// Routes
app.get('/', (req, res) => {
     res.json({
         msg:`Server started on port ${PORT}`,
         login: 'http://localhost:5000/auth/google'
     });
});

app.use('/', require('./routes/users'));
