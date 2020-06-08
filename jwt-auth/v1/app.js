const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

app.get('/api', (req, res)=>{
    res.json({
        message: 'Welcome User'
    });
});

app.post('/api/posts', verifyToken ,(req, res) => {
    jwt.verify(req.token, 'nilanjan',(err, authData)=>{
        if(err){
            res.sendStatus(403);
        }else{
            res.json({
                message: 'Post Created...',
                authData: authData
            });
        }
    });

});

app.post('/api/login', (req, res) => {
    const user={
        id: 1,
        username: 'nilanjan',
        email: 'nil@gmail.com'
    }
    jwt.sign({user: user}, 'nilanjan', {expiresIn: '30s'}, (err, token)=>{
         res.json({
             token: token
         });
    });
});

function verifyToken(req, res, next){
    console.log(req.headers);
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader!== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403);
    }
}
app.listen(4000, () => {
    console.log(`Server started on port 4000`);
});