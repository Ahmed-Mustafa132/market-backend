const express = require("express");
const router = express.Router();
const {
  createOrder,
    getAllOrdersForRep,
    getOrderSearch,
  getOrderById,
  deleteOrder,
  getOrderByState, approveOrder
} = require("../controllers/orderControllers");
const { isRepOrUserOrManger, isRep, isAuth, isManger} = require("../middleware/authMiddleware");

router.post("/",isRepOrUserOrManger, createOrder);
router.get("/", isAuth, getAllOrdersForRep);
router.get("/state/:state", isManger, getOrderByState);
router.put("/approve/:id",isManger,approveOrder);
router.get("/search/:search", isAuth, getOrderSearch);
router.get("/:id", isAuth, getOrderById);
router.delete("/:id", deleteOrder);

module.exports = router;
