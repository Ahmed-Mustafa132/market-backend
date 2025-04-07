const { Router } = require('express')
const router = Router()
const { getAllMissionsforRepAndMarket, getStateMissionForManger, getMissionForManger, getMissionById, createMission, deleteMission, updateMissionStatus, searchMissionByStateAndName } = require("../controllers/missionController")
const { isMarketOrRep, isManger } = require("../middleware/authMiddleware")
router.get("/manger", getMissionForManger);
router.get('/manger/state/:state', getStateMissionForManger);
router.get("/search/:state", isMarketOrRep, searchMissionByStateAndName);
router.get('/state/:state', isMarketOrRep, getAllMissionsforRepAndMarket);
router.get("/:id", getMissionById);
router.post("/", isManger, createMission);
router.delete("/:id", deleteMission);
router.patch('/:id/complete', updateMissionStatus);


module.exports = router