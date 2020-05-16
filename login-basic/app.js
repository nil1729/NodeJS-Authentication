const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const app = express();

const connectDb = async() => {
    try {
        await mongoose.connect('mongodb://localhost/auths-basic', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (e) {
        console.log('Refused To Connect');
    }
}

connectDb();

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

app.use(express.json()); // Use For post via http
app.get('/users', async(req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/users', async(req, res) => {
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = new User({
            name: req.body.name,
            password: hashedPassword
        });
        user = await user.save();
        console.log(user);
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
});

app.post('/users/login', async(req, res) => {
    try {
        const user = await User.findOne({
            name: req.body.name
        });
        console.log(user);
        if (user == null) {
            return res.sendStatus(404);
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            res.send('Hello World');
        } else {
            res.sendStatus(403);
        }

    } catch (e) {
        res.sendStatus(500);
    }
});

app.listen(5000, () => {
    console.log(`Server started on port`);
});