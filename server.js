require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const redis = require('./src/config/redis');

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

const startServer = async () => {
    await connectDB();
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });

    process.on('unhandledRejection', (err) => {
        console.error('UNHANDLED REJECTION! 💥 Shutting down...');
        console.error(err.name, err.message);
        server.close(() => process.exit(1));
    });
};

startServer();