const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return this.authProvider === 'email'; } },  // Only required for email auth
  company: { type: String, required: true },
  storageFolder: { type: String, required: true },  // e.g., user_id
  registrationCode: { type: String, default: null },  // 32-char hex code or null
  photoCredits: { type: Number, default: 10 },  // Free photo enhancements allowed
  photosEnhanced: { type: Number, default: 0 },  // Count of photos enhanced
  isUnlimited: { type: Boolean, default: false },  // If user has unlimited access via registration code
  
  // Google OAuth fields
  googleId: { type: String, sparse: true, unique: true },  // Google user ID
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },  // Authentication method
  profilePicture: { type: String, default: null },  // Google profile picture URL
  displayName: { type: String, default: null },  // User's display name from Google
  
  // Audit fields
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  // Only hash password for email authentication users
  if (!this.isModified('password') || this.authProvider !== 'email') return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  // Only compare passwords for email authentication users
  if (this.authProvider !== 'email' || !this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);