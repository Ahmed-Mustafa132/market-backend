const express = require('express'); 
const router = express.Router();
const {validateUserRegistration} = require('../middleware/authMiddleware');
const { getAllUser, getUserById, login, register } = require('../controllers/userController');
router.get('/', getAllUser);
router.get("/:id", getUserById);
router.post('/login', login);
router.post('/register', register);
module.exports = router;
