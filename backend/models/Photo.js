const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalPath: { type: String, required: true },
  enhancedPath: { type: String },
  classification: { type: String, enum: ['exterior', 'empty_interior', 'cluttered_interior'] },
  status: { type: String, default: 'pending' },  // pending, processing, done, error
  
  // Duplicate prevention fields
  imageHash: { type: String, index: true }, // SHA256 hash of the image content
  fileSize: { type: Number }, // File size in bytes
  originalName: { type: String }, // Original filename
  
  // Rate limiting fields
  processingStartedAt: { type: Date },
  apiCallsMade: { type: Number, default: 0 }, // Track number of API calls for this image
  lastProcessingAttempt: { type: Date },
  
  // Tagging and organization fields
  propertyAddress: { type: String, trim: true }, // "123 Main St, Anytown, ST 12345"
  roomName: { type: String, trim: true }, // "Living Room", "Kitchen", "Master Bedroom", etc.
  tags: [{ type: String, trim: true }], // Searchable tags: ["123 Main St", "Living Room"]
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient duplicate checking
photoSchema.index({ imageHash: 1, userId: 1 });
photoSchema.index({ status: 1, processingStartedAt: 1 });

// Indexes for efficient filtering and grouping
photoSchema.index({ userId: 1, propertyAddress: 1 });
photoSchema.index({ userId: 1, roomName: 1 });
photoSchema.index({ userId: 1, tags: 1 });

// Update the updatedAt field before saving
photoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Photo', photoSchema);