const router = require('express').Router();
const auth = require('../middleware/auth');
const { listDiscussions, createDiscussion, getDiscussion, addComment, upvoteDiscussion } = require('../controllers/discussionController');

router.get('/', listDiscussions);
router.get('/:id', getDiscussion);
router.post('/', auth, createDiscussion);
router.post('/:id/comments', auth, addComment);
router.put('/:id/upvote', auth, upvoteDiscussion);

module.exports = router;
