const router = require('express').Router();
const auth = require('../middleware/auth');
const { listJobs, createJob, getJob, updateJob, deleteJob } = require('../controllers/jobController');

router.get('/', listJobs);
router.post('/', auth, createJob);
router.get('/:id', getJob);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;
