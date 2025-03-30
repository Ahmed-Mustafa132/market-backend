const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { marketDashboard, approveData, getAllMarket, searchInMarket, getMarketById, login, register, deleteMarket, updataAccount } = require('../controllers/marketController');
const { isMarket, isManger } = require('../middleware/authMiddleware');
const uploadFields = upload.fields([
    { name: 'BusinessRecords', maxCount: 1 },
    { name: 'taxID', maxCount: 1 }
]);

router.get('/approved/:state', getAllMarket);
router.get("/approvedData/:id", approveData);
router.get('/dashboard', isMarket, marketDashboard);
router.put('/account',isManger, updataAccount)

router.get("/searsh/:name", searchInMarket)
router.get("/:id", getMarketById);
router.post('/login', login);
router.post('/register', uploadFields, register);
router.delete("/:id",deleteMarket)

module.exports = router;
