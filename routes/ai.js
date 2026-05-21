const router = require('express').Router();
const auth = require('../middleware/auth');
const { chat, clearHistory } = require('../controllers/aiController');

router.post('/chat', auth, chat);
router.delete('/history', auth, clearHistory);

module.exports = router;
