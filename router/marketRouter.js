const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getAllMarket, searchInMarket, getMarketById, login, register, deleteMarket } = require('../controllers/marketController');

const uploadFields = upload.fields([
    { name: 'BusinessRecords', maxCount: 1 },
    { name: 'taxID', maxCount: 1 }
]);

router.get('/', getAllMarket);
router.get("/searsh/:name", searchInMarket)
router.get("/:id", getMarketById);
router.post('/login', login);
router.post('/register', uploadFields, register);
router.delete("/:id",deleteMarket)

module.exports = router;
