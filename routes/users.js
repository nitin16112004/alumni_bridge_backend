const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');

router.get('/profile/:id', getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;
