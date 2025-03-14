// Import required packages
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();
const port = process.env.port;

app.use(cors());
app.use(express.json());

// Middleware
app.use(express.urlencoded({ extended: true }));
// Import routes
const marketRouter = require('./router/marketRouter');
const representativeRouter = require('./router/representativeRouter');
const userRouter = require('./router/userRouter');
const productRouter = require('./router/productRouter');

// Mount routes - all user related routes will be prefixed with '/user'
app.use('/user/market', marketRouter);
app.use('/user/representative', representativeRouter);
app.use('/user/user', userRouter);
app.use('/product', productRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
