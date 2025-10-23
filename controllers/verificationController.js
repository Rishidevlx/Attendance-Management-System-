const asyncHandler = require('express-async-handler');
const VerificationToken = require('../models/verificationTokenModel');
const crypto = require('crypto'); // For generating random digits

// Helper function to generate 4 random digits
const generateRandomDigits = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Generate a new auto token (and deactivate old/manual)
// @route   POST /api/verification/auto
// @access  Private (Admin)
const generateAutoToken = asyncHandler(async (req, res) => {
    // 1. Deactivate any currently active token (manual or auto)
    await VerificationToken.updateMany({ isActive: true }, { $set: { isActive: false } });

    // 2. Generate new auto token
    const newTokenValue = `SKD2025-ATD-${generateRandomDigits()}`;
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24-hour expiry

    const newToken = await VerificationToken.create({
        token: newTokenValue,
        type: 'auto',
        expiresAt: expires,
        isActive: true,
    });

    res.status(201).json(newToken);
});

// @desc    Create and activate a manual token (deactivates others)
// @route   POST /api/verification/manual
// @access  Private (Admin)
const createManualToken = asyncHandler(async (req, res) => {
    const { manualToken, expiryDateTime } = req.body;
    const trimmedToken = manualToken.trim(); // Trim whitespace

    // --- FINAL FIX: Backend Validation updated to match frontend rules ---
    // 1. Check if token is empty
    if (!trimmedToken) {
        res.status(400);
        throw new Error('Manual token cannot be empty.');
    }
    // 2. Check length (4 to 15 chars)
    if (trimmedToken.length < 4 || trimmedToken.length > 15) {
         res.status(400);
         throw new Error('Manual token must be between 4 and 15 characters long.');
    }
    // --- End FINAL FIX ---

    // 3. Check expiry date
    const expiryDate = new Date(expiryDateTime);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        res.status(400);
        throw new Error('Invalid or past expiry date provided.');
    }

    // 4. Deactivate any currently active token
    await VerificationToken.updateMany({ isActive: true }, { $set: { isActive: false } });

    // 5. Check if this exact manual token already exists (active or inactive)
    const existingToken = await VerificationToken.findOne({ token: trimmedToken, type: 'manual' });

    let newToken;
    if (existingToken) {
        // If exists, update its expiry and reactivate it
        existingToken.expiresAt = expiryDate;
        existingToken.isActive = true;
        newToken = await existingToken.save();
    } else {
        // If not exists, create a new one
        newToken = await VerificationToken.create({
            token: trimmedToken,
            type: 'manual',
            expiresAt: expiryDate,
            isActive: true,
        });
    }

    res.status(201).json(newToken);
});


// @desc    Get the currently active token (manual has priority)
// @route   GET /api/verification/active
// @access  Private (Admin)
const getActiveToken = asyncHandler(async (req, res) => {
    const now = new Date();
    // Find active manual token first
    let activeToken = await VerificationToken.findOne({
        type: 'manual',
        isActive: true,
        expiresAt: { $gt: now },
    });

    // If no active manual token, find active auto token
    if (!activeToken) {
        activeToken = await VerificationToken.findOne({
            type: 'auto',
            isActive: true,
            expiresAt: { $gt: now },
        });
    }

    // If still no active token (manual or auto), generate a new auto token
    if (!activeToken) {
        console.log("No active token found, generating a new auto token.");
        // Deactivate just in case (shouldn't be needed, but safe)
        await VerificationToken.updateMany({ isActive: true }, { $set: { isActive: false } });

        const newTokenValue = `SKD2025-ATD-${generateRandomDigits()}`;
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);

        activeToken = await VerificationToken.create({
            token: newTokenValue,
            type: 'auto',
            expiresAt: expires,
            isActive: true,
        });
    }

    res.json(activeToken);
});

// @desc    Validate a token during registration
// @route   POST /api/verification/validate
// @access  Public
const validateToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400);
        throw new Error('Verification token is required.');
    }

    const now = new Date();
    const foundToken = await VerificationToken.findOne({
        token: token,
        isActive: true,
        expiresAt: { $gt: now },
    });

    if (!foundToken) {
        res.status(400).json({ isValid: false, message: 'Invalid or expired verification token.' });
    } else {
        res.json({ isValid: true, message: 'Token is valid.' });
        // Optionally: Deactivate token after one use? Depends on requirements.
        // foundToken.isActive = false;
        // await foundToken.save();
    }
});


// @desc    Deactivate expired tokens (for cron job)
// @access  System Internal
const deactivateExpiredTokens = asyncHandler(async () => {
    console.log('Running scheduled job to deactivate expired verification tokens...');
    const now = new Date();
    const result = await VerificationToken.updateMany(
        { isActive: true, expiresAt: { $lt: now } },
        { $set: { isActive: false } }
    );

    if (result.modifiedCount > 0) {
        console.log(`Successfully deactivated ${result.modifiedCount} expired tokens.`);
    } else {
        console.log('No expired tokens found to deactivate.');
    }
});

module.exports = {
    generateAutoToken,
    createManualToken,
    getActiveToken,
    validateToken,
    deactivateExpiredTokens,
};

