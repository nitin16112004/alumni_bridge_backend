const router = require('express').Router();
const auth = require('../middleware/auth');
const { sendRequest, getSentRequests, getReceivedRequests, respondToRequest } = require('../controllers/mentorshipController');

router.post('/request', auth, sendRequest);
router.get('/sent', auth, getSentRequests);
router.get('/received', auth, getReceivedRequests);
router.put('/respond/:requestId', auth, respondToRequest);

module.exports = router;
