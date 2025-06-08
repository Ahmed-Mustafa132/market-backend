// Import required packages
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Load environment variables from .env file
dotenv.config();
const port = process.env.port;

app.use(cors());
app.use(express.json());

app.use(express.json({ limit: '10mb' }));


// Middleware
app.use(express.urlencoded({ extended: true }));
// Import routes
const { checkAuth } = require("./middleware/authMiddleware")
const marketRouter = require("./router/marketRouter");
const representativeRouter = require("./router/representativeRouter");
const userRouter = require("./router/userRouter");
const mangerRouter = require("./router/mangerRouter");
const productRouter = require("./router/productRouter");
const missionRouter = require("./router/missionRouter");
const massageRouter = require("./router/massageRouter");
const orderRouter = require("./router/orderRouter");


// app.get("/", checkAuth)

app.use("/auth/market", marketRouter);
app.use("/auth/representative", representativeRouter);
app.use("/auth/user", userRouter);
app.use("/auth/manger", mangerRouter);
app.use("/product", productRouter);
app.use("/mission", missionRouter);
app.use('/massage', massageRouter)
app.use('/order', orderRouter)

app.use("/uploads", express.static("uploads"));
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
