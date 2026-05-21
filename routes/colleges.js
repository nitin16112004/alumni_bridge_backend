const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { getCollegeInfo, listColleges, getPendingUsers, approveUser, rejectUser } = require('../controllers/collegeController');

router.get('/', listColleges);
router.get('/me', auth, authorize('college'), getCollegeInfo);
router.get('/pending', auth, authorize('college'), getPendingUsers);
router.put('/approve/:userId', auth, authorize('college'), approveUser);
router.put('/reject/:userId', auth, authorize('college'), rejectUser);

module.exports = router;
