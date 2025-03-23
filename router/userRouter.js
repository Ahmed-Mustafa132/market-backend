const express = require('express');
const router = express.Router();
const { getAllUser, searchInUser, getUserById, login, register, google } = require('../controllers/userController');
const { checkAuth } = require("../middleware/authMiddleware")
router.get('/', getAllUser);
router.get("/checkauth", checkAuth)
router.get("/searsh/:name", searchInUser)
router.get("/:id", getUserById);
router.post('/login', login);
router.post('/register', register);
router.post("/google", google);
module.exports = router;
