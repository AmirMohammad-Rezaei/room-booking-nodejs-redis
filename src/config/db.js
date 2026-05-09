const { default: mongoose } = require("mongoose")

exports.connectDB = async function () {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`mongodb is connected : ${conn.connection.host}`)
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}
