const router = require('express').Router();
const auth = require('../middleware/auth');
const { getConversations, startConversation, getMessages, sendMessage } = require('../controllers/chatController');

router.get('/conversations', auth, getConversations);
router.post('/conversations', auth, startConversation);
router.get('/conversations/:id/messages', auth, getMessages);
router.post('/conversations/:id/messages', auth, sendMessage);

module.exports = router;
