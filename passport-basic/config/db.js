const mongoose = require('mongoose');
module.exports = async(db) => {
    try {
        await mongoose.connect(db, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected.....');
    } catch (e) {
        console.log(e.name);
        console.log('Refused to Connect !!!');
    }
};