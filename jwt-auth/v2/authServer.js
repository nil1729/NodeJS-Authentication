if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json());

app.post('/posts/login', (req, res) => {
    const user = req.body;
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({user}, process.env.REFRESH_TOKEN_KEY);
     res.json({
         accessToken,
         refreshToken
     });
});

const generateAccessToken = (user)=>{
    return  jwt.sign({user},  process.env.SECRET_KEY , {expiresIn: '30s'});
}
app.listen(5000, () => {
    console.log(`Server started on port 5000`);
});