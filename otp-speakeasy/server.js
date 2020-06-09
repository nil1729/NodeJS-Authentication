const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const Speakeasy = require('speakeasy');
const URI = `http://localhost:${PORT}`;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
     res.json({
         msg: `Server Started on port ${PORT}`,
         'otp': `${URI}/totp/secret`
     });
});

app.get('/totp/secret', (req, res) => {
    const secret = Speakeasy.generateSecret({length: 20});
    const token = Speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        window: 2,
    });
    console.log(token);
    res.redirect(`/${secret.base32}/verify`);
});


app.get('/:secret/verify', (req, res) => {
    res.render('verify', {secret: req.params.secret});
});

app.post('/totp/verify/:secret', (req, res) => {
    var tokenValidates = Speakeasy.totp.verify({
        secret: req.params.secret,
        encoding: 'base32',
        token: req.body.token,
        window: 2,
    });
    res.json({
        valid: tokenValidates
    });
});


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
// ======== Create Full Functional Server ========= //