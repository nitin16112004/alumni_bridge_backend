const router = require('express').Router();
const auth = require('../middleware/auth');
const { listEvents, createEvent, getEvent, registerForEvent } = require('../controllers/eventController');

router.get('/', listEvents);
router.post('/', auth, createEvent);
router.get('/:id', getEvent);
router.post('/:id/register', auth, registerForEvent);

module.exports = router;
