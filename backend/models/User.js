const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true },
  storageFolder: { type: String, required: true },  // e.g., user_id
  registrationCode: { type: String, default: null },  // 32-char hex code or null
  photoCredits: { type: Number, default: 10 },  // Free photo enhancements allowed
  photosEnhanced: { type: Number, default: 0 },  // Count of photos enhanced
  isUnlimited: { type: Boolean, default: false }  // If user has unlimited access via registration code
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);