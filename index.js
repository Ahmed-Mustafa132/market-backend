// Import required packages
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

 
// Load environment variables from .env file
dotenv.config();
const port = process.env.port;


const corsOptions = {
  origin: ['https://market-frontend-rouge.vercel.app'], // رابط الفرونت إند المسموح له بالوصول
  credentials: true,  // السماح بإرسال واستقبال الكوكيز والهيدرز
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // الطرق المسموح بها
  allowedHeaders: ['Content-Type', 'Authorization'] // الهيدرز المسموح بها
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware
app.use(express.urlencoded({ extended: true }));
// Import routes
const userRouter = require('./router/userRouter');
// const productRouter = require('./router/productRouter');

// Mount routes - all user related routes will be prefixed with '/user'
app.use('/user', userRouter);
// app.use('/product', productRouter);

dbConn();

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
