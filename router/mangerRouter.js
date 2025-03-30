const { Router } = require('express');
const router = Router();
const upload = require('../middleware/multer');
const { updateAccount, getAllManger, mangerDashboard,searchInManger, getMangerById, login, register } = require('../controllers/mangerController');
const uploadFields = upload.fields([
    { name: 'identityFront', maxCount: 1 },
    { name: 'identityBack', maxCount: 1 }
]);
router.get('/', getAllManger);
router.get("/searsh/:name", searchInManger)
router.get('/mangerDashboard', mangerDashboard);
router.put('/account', updateAccount);
router.get("/:id", getMangerById);
router.post('/login', login);
router.post('/register', uploadFields, register);
module.exports = router;
