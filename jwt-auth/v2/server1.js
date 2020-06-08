if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const postsDB = [
    {
        user: 'jim',
        post: 'post1'
    },
    {
        user: 'john',
        post: 'post2'
    }
];
const verifyToken = (req, res, next)=>{
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader === 'undefined'){
        return res.sendStatus(403);
    }else{
        const token = bearerHeader.split(' ')[1];
        req.token = token;
        next();
    }
};
app.use(express.json());

app.get('/posts', verifyToken, (req, res) => {
     jwt.verify(req.token, process.env.SECRET_KEY , (err, authData)=>{
         if(err){
             res.sendStatus(403);
         }else{
             const posts = postsDB.filter(post => post.user === authData.user.name);
              res.json({
                  posts,
                  authData
              });
         }
     });
});

app.post('/posts/login', (req, res) => {
    const user = req.body;
    jwt.sign({user},  process.env.SECRET_KEY , {expiresIn: '30s'},(err, token)=>{
        if(err){
             res.json(err);
        }else{
            res.json({
                token: token
            });
        }
    });
});

app.listen(4000, () => {
    console.log(`Server started on port 4000`);
});