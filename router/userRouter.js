const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { validateRegistration } = require('../middleware/authMiddleware');
const { getUsers,getUserById, login, register } = require('../controllers/userController');

const uploadFields = upload.fields([
    { name: 'identityFront', maxCount: 1 },
    { name: 'identityBack', maxCount: 1 },
    { name: 'BusinessRecords', maxCount: 1 },
    { name: 'taxID', maxCount: 1 }
]);

router.get('/', getUsers);
router.get("/:id", getUserById);
router.post('/login', login);
router.post('/register', uploadFields, validateRegistration, register);

module.exports = router;
