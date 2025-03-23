const { Router } = require("express")
const router = Router()
const { getMassage, createMassage } = require("../controllers/massageController")
const { verifyMassage } = require("../middleware/authMiddleware")

router.get("/",verifyMassage ,getMassage)
router.post("/", createMassage)

module.exports = router