// Import required packages
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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
const mangerRouter = require('./router/mangerRouter');
const productRouter = require('./router/productRouter');

// Mount routes - all user related routes will be prefixed with '/user'
app.use('/auth/market', marketRouter);
app.use('/auth/representative', representativeRouter);
app.use('/auth/user', userRouter);
app.use('/auth/manger', mangerRouter);
app.use('/product', productRouter);


// googelauth 



// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
