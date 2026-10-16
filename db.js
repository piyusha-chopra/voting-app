const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
const mongoURL = process.env.MONGO_URL_LOCAL; //loacl db URL
//const mongoURL = process.env.MONGO_URL; //Online MongoDB Atlas


// Set up MongoDB connection
mongoose.connect(mongoURL);

// Get the default connection
const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export a database connection
module.exports = db;

