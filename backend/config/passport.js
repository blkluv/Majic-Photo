const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const mongoose = require('mongoose');
const { createUserFolder } = require('./storage');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback received for:', profile.emails[0].value);

      // Check if user already exists with this Google ID
      let existingUser = await User.findOne({ googleId: profile.id });
      
      if (existingUser) {
        console.log('Existing Google user found:', existingUser.email);
        // Update last login time
        existingUser.lastLogin = new Date();
        await existingUser.save();
        return done(null, existingUser);
      }

      // Check if user exists with same email (email registration)
      let emailUser = await User.findOne({ 
        email: profile.emails[0].value,
        authProvider: 'email' 
      });

      if (emailUser) {
        console.log('Email user exists, linking Google account:', emailUser.email);
        // Link Google account to existing email user
        emailUser.googleId = profile.id;
        emailUser.authProvider = 'google';
        emailUser.profilePicture = profile.photos[0]?.value || null;
        emailUser.displayName = profile.displayName;
        emailUser.lastLogin = new Date();
        await emailUser.save();
        return done(null, emailUser);
      }

      // Create new user with Google OAuth
      console.log('Creating new Google user:', profile.emails[0].value);
      const tempId = new mongoose.Types.ObjectId().toString();
      
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        company: profile.emails[0].value.split('@')[1] || 'Google User', // Use domain as company
        displayName: profile.displayName,
        profilePicture: profile.photos[0]?.value || null,
        authProvider: 'google',
        storageFolder: tempId,
        photoCredits: 10,  // Default free credits
        isUnlimited: false,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      await newUser.save();
      console.log(`Google user created: ${newUser.email}`);

      // Update storageFolder to user._id and create S3 folder
      newUser.storageFolder = newUser._id.toString();
      await newUser.save();
      console.log(`Storage folder assigned: ${newUser.storageFolder}`);

      await createUserFolder(newUser.storageFolder);
      console.log(`S3 folder created for Google user: ${newUser.storageFolder}`);

      return done(null, newUser);

    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;