const { Router } = require('express')
const router = Router()
const { getAllMissionsforRepAndMarket,getStateMissionForManger,getMissionForManger,getMissionById,createMission,deleteMission} = require("../controllers/missionController")
const { isMarketOrRep } = require("../middleware/authMiddleware")
router.get("/manger", getMissionForManger);
router.get('/manger/state/:state', getStateMissionForManger);
router.get('/state/:state', isMarketOrRep, getAllMissionsforRepAndMarket);
router.get("/:id", getMissionById);
router.post("/", createMission);
router.delete("/:id", deleteMission);
module.exports = router