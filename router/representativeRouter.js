const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getAllRepresentative, searchInRepresentative, getRepresentativeById, deleteRepresentative, uploudLocation, login, register } = require('../controllers/representativeController');
const {isRep} = require("../middleware/authMiddleware")
const uploadFields = upload.fields([
    { name: 'identityFront', maxCount: 1 },
    { name: 'identityBack', maxCount: 1 }
]);
router.get('/', getAllRepresentative);
router.get("/searsh/:name", searchInRepresentative)
router.get("/:id", getRepresentativeById); 
router.delete("/:id", deleteRepresentative)
router.put("/",isRep ,uploudLocation)
router.post('/login', login);
router.post('/register', uploadFields, register);
module.exports = router;