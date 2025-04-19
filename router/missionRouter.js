const { Router } = require("express");
const router = Router();
const {
  getAllMissionsforRepAndMarket,
  getStateMissionForManger,
  getMissionForManger,
  getMissionById,
  createMission,
  deleteMission,
  updateMissionStatus,
  searchMissionByStateAndName,
  unApproveMission,
} = require("../controllers/missionController");
const { isMarketOrRep, isManger } = require("../middleware/authMiddleware");
router.get("/manger",isManger,getMissionForManger);
router.get("/manger/state/:state",isManger, getStateMissionForManger);
router.get("/search/:state", isMarketOrRep, searchMissionByStateAndName);
router.get("/state/:state", isMarketOrRep, getAllMissionsforRepAndMarket);
router.get("/:id", getMissionById);
router.post("/", isManger, createMission);
router.delete("/:id", deleteMission);
router.patch("/:id/complete", updateMissionStatus);
router.patch("/:id/approved", unApproveMission);

module.exports = router;
