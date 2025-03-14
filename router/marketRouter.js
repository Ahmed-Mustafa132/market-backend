const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { validateMarketRegistration } = require('../middleware/authMiddleware');
const { getAllMarket,getMarketById, login, register } = require('../controllers/marketController');

const uploadFields = upload.fields([
    { name: 'BusinessRecords', maxCount: 1 },
    { name: 'taxID', maxCount: 1 }
]);

router.get('/', getAllMarket);
router.get("/:id", getMarketById);
router.post('/login', login);
router.post('/register', uploadFields, validateMarketRegistration, register);

module.exports = router;
