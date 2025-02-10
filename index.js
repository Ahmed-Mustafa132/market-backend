// Import required packages
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();
const port = process.env.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Import routes
const userRouter = require('./router/userRouter');

// Mount routes - all user related routes will be prefixed with '/user'
app.use('/user', userRouter);


// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});