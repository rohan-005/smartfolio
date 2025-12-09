const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        // const conn = await mongoose.connect(process.env.MONGO_URL);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connected ${mongoose.connection.host} `)
    } catch (error) {
        console.log(`error  ${error}`);
    }
}


module.exports = connectdb