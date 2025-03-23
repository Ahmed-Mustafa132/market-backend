const { Router } = require('express');
const router = Router();
const { getAllManger, mangerDashboard,searchInManger, getMangerById, login, register } = require('../controllers/mangerController');
router.get('/', getAllManger);
router.get("/searsh/:name", searchInManger)
router.get('/mangerDashboard', mangerDashboard);
router.get("/:id", getMangerById);
router.post('/login', login);
router.post('/register', register);
module.exports = router;
