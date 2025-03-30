const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { approveData,repDashboard, getAllRepresentative, searchInRepresentative, getRepresentativeById, deleteRepresentative, uploudLocation, updataAccount, login, register } = require('../controllers/representativeController');
const {isRep, isManger} = require("../middleware/authMiddleware")
const uploadFields = upload.fields([
    { name: 'identityFront', maxCount: 1 },
    { name: 'identityBack', maxCount: 1 }
]);
router.get('/approved/:state', getAllRepresentative);
router.get("/approvedData/:id", approveData);
router.get("/dashboard", isRep, repDashboard)
router.put('/account',isManger, updataAccount)
router.get("/searsh/:name", searchInRepresentative)
router.get("/:id", getRepresentativeById); 
router.delete("/:id", deleteRepresentative)
router.put("/",isRep ,uploudLocation)
router.post('/login', login);
router.post('/register', uploadFields, register);
module.exports = router;