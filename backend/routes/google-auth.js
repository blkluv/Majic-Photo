const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Initiate Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      console.log(`Google OAuth successful for user: ${req.user.email}`);
      
      // Redirect to frontend with token
      // Use relative path to ensure proper routing through the backend
      const redirectUrl = `/?token=${token}&auth=google`;
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`/?error=auth_failed`);
    }
  }
);

// Link Google account to existing user (for users who signed up with email first)
router.post('/google/link', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password required' });
    }

    // Find email user and verify password
    const user = await User.findOne({ email, authProvider: 'email' });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // Return a temporary token for Google OAuth linking
    const linkToken = jwt.sign(
      { id: user._id, action: 'link_google' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10m' }
    );

    res.json({ 
      msg: 'Ready to link Google account',
      linkToken,
      googleAuthUrl: `/api/auth/google?link_token=${linkToken}`
    });

  } catch (error) {
    console.error('Google link preparation error:', error);
    res.status(500).json({ msg: 'Server error during account linking' });
  }
});

// Get user's OAuth status
router.get('/oauth-status', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      authProvider: user.authProvider,
      hasGoogleAuth: !!user.googleId,
      profilePicture: user.profilePicture,
      displayName: user.displayName,
      canLinkGoogle: user.authProvider === 'email' && !user.googleId
    });
  } catch (error) {
    console.error('OAuth status error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;