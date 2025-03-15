const { Router } = require('express');
const router = Router();
const { getAllManger, getMangerById, login, register } = require('../controllers/mangerController');
router.get('/', getAllManger);
router.get("/:id", getMangerById);
router.post('/login', login);
router.post('/register', register);
module.exports = router;
