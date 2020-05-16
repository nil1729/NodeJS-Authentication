const mongoose = require('mongoose');
module.exports = async(key) => {
    try {
        await mongoose.connect(key, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected ......');
    } catch (e) {
        console.log('Refused to connect');
    }
};