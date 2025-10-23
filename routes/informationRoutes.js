const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    voteOnPoll,
    pinPost,
    updatePost,
    deletePost,
    deleteBulkPosts,
    toggleLikePost, // --- NEW ---
    editVote,       // --- NEW ---
} = require('../controllers/informationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createPost)
    .get(protect, getAllPosts);

router.route('/vote/:id').put(protect, voteOnPoll);
router.route('/pin/:id').put(protect, admin, pinPost);

// --- NEW: Routes for likes and vote edits ---
router.route('/like/:id').put(protect, toggleLikePost);
router.route('/vote/edit/:id').put(protect, editVote);

// --- Routes for editing and deleting posts ---
router.route('/bulk-delete').post(protect, admin, deleteBulkPosts);
router.route('/:id')
    .put(protect, admin, updatePost)
    .delete(protect, admin, deletePost);


module.exports = router;
