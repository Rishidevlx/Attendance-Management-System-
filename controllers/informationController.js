const asyncHandler = require('express-async-handler');
const Information = require('../models/informationModel');

// @desc    Create a new message or poll
// @route   POST /api/info
// @access  Private (Admin)
const createPost = asyncHandler(async (req, res) => {
    const { type, content, pollOptions, isMultiSelect } = req.body;

    if (!type || !content) {
        res.status(400);
        throw new Error('Please provide type and content.');
    }

    if (type === 'poll' && (!pollOptions || pollOptions.length < 2)) {
        res.status(400);
        throw new Error('Polls must have at least two options.');
    }

    const post = new Information({
        type,
        content,
        pollOptions: type === 'poll' ? pollOptions.map(opt => ({ text: opt, votes: [] })) : [],
        isMultiSelect: type === 'poll' ? isMultiSelect : false,
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
});

// @desc    Get all messages and polls
// @route   GET /api/info
// @access  Private
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Information.find({}).sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
});

// @desc    Vote on a poll
// @route   PUT /api/info/vote/:id
// @access  Private
const voteOnPoll = asyncHandler(async (req, res) => {
    const { optionIds } = req.body;
    const poll = await Information.findById(req.params.id);

    if (poll && poll.type === 'poll') {
        const userId = req.user._id;

        if (poll.isMultiSelect) {
            if (!Array.isArray(optionIds) || optionIds.length === 0) {
                res.status(400);
                throw new Error('Please select at least one option.');
            }
            optionIds.forEach(optionId => {
                const option = poll.pollOptions.id(optionId);
                if (option && !option.votes.includes(userId)) {
                    option.votes.push(userId);
                }
            });
        } else {
             const hasVoted = poll.pollOptions.some(opt => opt.votes.includes(userId));
             if (hasVoted) {
                 res.status(400);
                 throw new Error('You have already voted on this poll.');
             }
             const option = poll.pollOptions.id(optionIds[0]);
             if (option) {
                 option.votes.push(userId);
             } else {
                 res.status(404);
                 throw new Error('Option not found.');
             }
        }
        await poll.save();
        res.json(poll);
    } else {
        res.status(404);
        throw new Error('Poll not found.');
    }
});

// --- NEW: Edit a user's vote (one-time) ---
const editVote = asyncHandler(async (req, res) => {
    const { optionIds } = req.body;
    const poll = await Information.findById(req.params.id);
    const userId = req.user._id;

    if (!poll || poll.type !== 'poll') {
        res.status(404);
        throw new Error('Poll not found.');
    }

    // --- BUG FIX: Use .equals() for comparing ObjectIDs ---
    if (poll.votersWhoEdited.some(id => id.equals(userId))) {
        res.status(403);
        throw new Error('You can only edit your vote once.');
    }

    // Remove all previous votes by this user on this poll
    poll.pollOptions.forEach(option => {
        const voteIndex = option.votes.indexOf(userId);
        if (voteIndex > -1) {
            option.votes.splice(voteIndex, 1);
        }
    });

    // Add new votes
    if (poll.isMultiSelect) {
        optionIds.forEach(optId => {
            const option = poll.pollOptions.id(optId);
            if(option) option.votes.push(userId);
        });
    } else {
        const option = poll.pollOptions.id(optionIds[0]);
        if(option) option.votes.push(userId);
    }

    // Mark user as having edited their vote
    poll.votersWhoEdited.push(userId);

    await poll.save();
    res.json(poll);
});


// --- NEW: Like or unlike a post ---
const toggleLikePost = asyncHandler(async (req, res) => {
    const post = await Information.findById(req.params.id);
    if (!post) {
        res.status(404);
        throw new Error('Post not found.');
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
        // User has already liked, so unlike
        post.likes.splice(likeIndex, 1);
    } else {
        // User has not liked, so like
        post.likes.push(userId);
    }

    await post.save();
    res.json(post);
});


// @desc    Pin or unpin a post
// @route   PUT /api/info/pin/:id
// @access  Private (Admin)
const pinPost = asyncHandler(async (req, res) => {
    const post = await Information.findById(req.params.id);
    const { pin, durationDays } = req.body;

    if (post) {
        if (pin) {
            const pinnedCount = await Information.countDocuments({ isPinned: true });
            if (pinnedCount >= 2) {
                res.status(400);
                throw new Error('You can only pin a maximum of 2 posts.');
            }
            post.isPinned = true;
            if (durationDays) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays, 10));
                post.pinExpiresAt = expiryDate;
            } else {
                post.pinExpiresAt = null;
            }
        } else {
            post.isPinned = false;
            post.pinExpiresAt = null;
        }

        await post.save();
        res.json({ message: `Post ${pin ? 'pinned' : 'unpinned'} successfully.` });
    } else {
        res.status(404);
        throw new Error('Post not found.');
    }
});

// @desc    Check for expired pins and unpin them
const checkExpiredPins = asyncHandler(async () => {
    console.log('Running scheduled job to check for expired pins...');
    const now = new Date();
    const result = await Information.updateMany(
        { isPinned: true, pinExpiresAt: { $ne: null, $lt: now } },
        { $set: { isPinned: false, pinExpiresAt: null } }
    );

    if (result.modifiedCount > 0) {
        console.log(`Successfully unpinned ${result.modifiedCount} expired posts.`);
    } else {
        console.log('No expired pins found.');
    }
});

const deleteOldPosts = asyncHandler(async () => {
    console.log('Running scheduled job to delete old posts...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Information.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isPinned: false
    });

    if (result.deletedCount > 0) {
        console.log(`Successfully deleted ${result.deletedCount} posts older than 30 days.`);
    } else {
        console.log('No old posts found to delete.');
    }
});

const updatePost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const post = await Information.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (post.createdAt < twentyFourHoursAgo) {
        res.status(403);
        throw new Error('Cannot edit posts older than 24 hours.');
    }

    post.content = content || post.content;
    const updatedPost = await post.save();
    res.json(updatedPost);
});

const deletePost = asyncHandler(async (req, res) => {
    const post = await Information.findById(req.params.id);
    if (post) {
        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

const deleteBulkPosts = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        res.status(400);
        throw new Error('No post IDs provided');
    }
    await Information.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Posts deleted successfully' });
});


module.exports = {
    createPost,
    getAllPosts,
    voteOnPoll,
    pinPost,
    checkExpiredPins,
    updatePost,
    deletePost,
    deleteBulkPosts,
    deleteOldPosts,
    toggleLikePost,
    editVote,
};

