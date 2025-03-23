const { Router } = require('express')
const router = Router()
const { getAllMissionsforRep,getMissionForManger,getMissionById,createMission,deleteMission} = require("../controllers/missionController")
const { isRep } = require("../middleware/authMiddleware")
router.get("/manger", getMissionForManger);
router.get('/:state',isRep, getAllMissionsforRep);
router.get("/:id", getMissionById);
router.post("/", createMission);
router.delete("/:id", deleteMission);
module.exports = router