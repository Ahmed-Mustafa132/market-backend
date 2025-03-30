const express = require('express');
const { createMessagForMarket, createMessagForRep, getUserMessages } = require('../controllers/massageController');
const router = express.Router();
const {isManger, isMarketOrRep} = require('../middleware/authMiddleware')

router.post('/sendMessages/market', isManger, createMessagForMarket);
router.post('/sendMessages/representative', isManger, createMessagForRep);
router.get('/messages',isMarketOrRep, getUserMessages);
// router.get('/messages/user/:userId', );
// router.get('/messages/unread/:userId', );
// router.patch('/messages/:messageId/read', );
// router.delete('/messages/:messageId',);

module.exports = router;
