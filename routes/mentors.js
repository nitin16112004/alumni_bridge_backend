const router = require('express').Router();
const auth = require('../middleware/auth');
const { listMentors, getMentor, createMentor, updateMentor, deleteMentor, getMyMentorProfile } = require('../controllers/mentorController');

router.get('/', listMentors);
router.get('/me', auth, getMyMentorProfile);
router.get('/:id', getMentor);
router.post('/', auth, createMentor);
router.put('/:id', auth, updateMentor);
router.delete('/:id', auth, deleteMentor);

module.exports = router;
