const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { validateRegistration } = require('../middleware/authMiddleware');
const { getUsers, login, register } = require('../controllers/userController');

const uploadFields = upload.fields([
    { name: 'identityFront', maxCount: 1 },
    { name: 'identityBack', maxCount: 1 }
]);

router.get('/', getUsers);
router.post('/login', login);
router.post('/register', uploadFields, validateRegistration, register);

module.exports = router;
