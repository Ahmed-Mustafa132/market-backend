const express = require('express');
const router = express.Router();
const { getAllUser, searchInUser, getUserById, deleteUser, login, register, google ,forgotPassword,resetPassword} = require('../controllers/userController');
const { checkAuth } = require("../middleware/authMiddleware")
router.get('/', getAllUser);
router.get("/checkauth", checkAuth)
router.get("/searsh/:name", searchInUser)
router.get("/:id", getUserById);
router.delete("/:id",deleteUser)
router.post('/login', login);
router.post('/register', register);
router.post("/google", google);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
module.exports = router;
