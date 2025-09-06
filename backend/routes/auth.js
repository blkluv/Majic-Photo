const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { createUserFolder } = require('../config/storage');

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const remainingCredits = user.photoCredits - user.photosEnhanced;
    
    res.json({
      id: user._id,
      email: user.email,
      company: user.company,
      photoCredits: user.photoCredits,
      photosEnhanced: user.photosEnhanced,
      remainingCredits: remainingCredits,
      isUnlimited: user.isUnlimited,
      hasRegistrationCode: !!user.registrationCode
    });
  } catch (err) {
    console.error('Get user info error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { email, password, company, registrationCode } = req.body;
  try {
    // Validate input
    if (!email || !password || !company) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Validate registration code format if provided
    let isUnlimited = false;
    if (registrationCode) {
      // Check if it's a 32-character hexadecimal string
      const hexPattern = /^[0-9a-fA-F]{32}$/;
      if (!hexPattern.test(registrationCode)) {
        return res.status(400).json({ msg: 'Invalid registration code format. Must be 32-character hexadecimal string.' });
      }
      
      // TODO: In production, you'd validate against a database of valid codes
      // For now, any valid 32-char hex code grants unlimited access
      isUnlimited = true;
      console.log(`Registration with code: ${registrationCode} - granting unlimited access`);
    }

    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user with storageFolder set to a temporary unique ID
    const tempId = new mongoose.Types.ObjectId().toString();
    user = new User({ 
      email, 
      password, 
      company, 
      storageFolder: tempId,
      registrationCode: registrationCode || null,
      photoCredits: isUnlimited ? 999999 : 10,  // High number for unlimited
      isUnlimited: isUnlimited
    });
    await user.save();
    console.log(`User created: ${email}`);

    // Update storageFolder to user._id and create S3 folder
    user.storageFolder = user._id.toString();
    await user.save();
    console.log(`Storage folder assigned: ${user.storageFolder}`);

    await createUserFolder(user.storageFolder);
    console.log(`S3 folder created for user: ${user.storageFolder}`);

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, company } });
  } catch (err) {
    console.error('Registration error:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, company: user.company } });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;