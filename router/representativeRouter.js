const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { validateRepresentativeRegistration } = require('../middleware/authMiddleware');
const { getAllRepresentative, getRepresentativeById, login, register } = require('../controllers/representativeController');
const uploadFields = upload.fields([
    { name: 'identityFront', maxCount: 1 },
    { name: 'identityBack', maxCount: 1 }
]);
router.get('/', getAllRepresentative);
router.get("/:id", getRepresentativeById);
router.post('/login', login);
router.post('/register', uploadFields, validateRepresentativeRegistration, register);
module.exports = router;