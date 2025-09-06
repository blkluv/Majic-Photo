const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Photo = require('../models/Photo');
const User = require('../models/User'); // Add missing import
const { uploadToS3, generatePresignedUrl, getFileFromS3 } = require('../config/storage');
const { classifyImage, enhanceImage } = require('../utils/imageAI');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for S3 upload

// Helper function to generate image hash
function generateImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Helper function to check for duplicate images
async function findDuplicateImage(userId, imageHash, fileSize) {
  return await Photo.findOne({
    userId: userId,
    imageHash: imageHash,
    fileSize: fileSize
  });
}

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  // Use req.headers to avoid case-sensitivity issues
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('No token provided in headers:', req.headers);
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Authenticated user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};

// Upload photos
router.post('/upload', verifyToken, upload.array('photos', 10), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files ? req.files.length : 'No files');
    
    const files = req.files;
    if (!files || files.length === 0) {
      console.log('No files uploaded in request');
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(400).json({ msg: 'User not found' });
    }
    const folder = user.storageFolder;

    const photoDocs = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        console.log(`Skipping invalid file type: ${file.originalname}, ${file.mimetype}`);
        continue; // Skip invalid files
      }
      if (file.size > 10 * 1024 * 1024) {
        console.log(`Skipping file too large: ${file.originalname}, ${file.size} bytes`);
        continue; // Skip files > 10MB
      }

      // Generate image hash for duplicate detection
      const imageHash = generateImageHash(file.buffer);
      console.log(`Generated hash for ${file.originalname}: ${imageHash.substring(0, 16)}...`);

      // Check for duplicate images
      const existingPhoto = await findDuplicateImage(userId, imageHash, file.size);
      if (existingPhoto) {
        console.log(`Duplicate image detected for ${file.originalname}, using existing photo ${existingPhoto._id}`);
        
        // Return existing photo instead of creating new one
        photoDocs.push(existingPhoto);
        continue;
      }

      const originalKey = `originals/${folder}/${Date.now()}-${file.originalname}`; // Add timestamp to avoid overwrites
      await uploadToS3(file.buffer, originalKey, file.mimetype);
      console.log(`Uploaded to S3: ${originalKey}`);

      // Create tags array for search functionality
      const tags = [];
      if (propertyAddress && propertyAddress.trim()) {
        tags.push(propertyAddress.trim());
      }
      if (roomName && roomName.trim()) {
        tags.push(roomName.trim());
      }

      const photo = new Photo({
        userId,
        originalPath: originalKey,
        status: 'processing',
        imageHash: imageHash,
        fileSize: file.size,
        originalName: file.originalname,
        processingStartedAt: new Date(),
        propertyAddress: propertyAddress?.trim() || null,
        roomName: roomName?.trim() || null,
        tags: tags
      });
      await photo.save();
      console.log(`Saved photo to MongoDB: ${photo._id}`);
      photoDocs.push(photo);

      // Process async
      processPhoto(photo._id).catch(err => {
        console.error(`Error in processPhoto for ${photo._id}:`, err.message);
      });
    }

    res.json({ 
      msg: `Successfully submitted ${photoDocs.length} photo(s) for AI processing`, 
      photos: photoDocs 
    });
  } catch (err) {
    console.error('Processing error:', err.message, err.stack);
    res.status(500).json({ msg: 'AI processing submission failed', error: err.message });
  }
});

// Process photos endpoint (alias for upload with better naming)
router.post('/process', verifyToken, upload.array('photos', 10), async (req, res) => {
  try {
    console.log('AI Processing request received');
    console.log('Request files:', req.files ? req.files.length : 'No files');
    
    const files = req.files;
    if (!files || files.length === 0) {
      console.log('No files submitted for processing');
      return res.status(400).json({ msg: 'No photos submitted for processing' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(400).json({ msg: 'User not found' });
    }
    const folder = user.storageFolder;

    // Check photo credits before processing
    const remainingCredits = user.photoCredits - user.photosEnhanced;
    if (!user.isUnlimited && remainingCredits <= 0) {
      console.log(`User ${userId} has exceeded photo limit (${user.photosEnhanced}/${user.photoCredits})`);
      return res.status(403).json({ 
        msg: 'You have reached your photo enhancement limit. Please upgrade or use a registration code for more credits.',
        creditsUsed: user.photosEnhanced,
        creditsTotal: user.photoCredits
      });
    }

    // Check if this batch would exceed the limit
    if (!user.isUnlimited && files.length > remainingCredits) {
      console.log(`User ${userId} attempting to process ${files.length} photos but only has ${remainingCredits} credits remaining`);
      return res.status(403).json({ 
        msg: `You can only process ${remainingCredits} more photos. You are trying to process ${files.length} photos.`,
        creditsUsed: user.photosEnhanced,
        creditsTotal: user.photoCredits,
        creditsRemaining: remainingCredits
      });
    }
    
    // Extract address and room info from request body
    const { propertyAddress, roomName } = req.body;
    console.log('Tagging info:', { propertyAddress, roomName });

    const photoDocs = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        console.log(`Skipping invalid file type: ${file.originalname}, ${file.mimetype}`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        console.log(`Skipping file too large: ${file.originalname}, ${file.size} bytes`);
        continue;
      }

      // Generate image hash for duplicate detection
      const imageHash = generateImageHash(file.buffer);
      console.log(`Generated hash for ${file.originalname}: ${imageHash.substring(0, 16)}...`);

      // Check for duplicate images
      const existingPhoto = await findDuplicateImage(userId, imageHash, file.size);
      if (existingPhoto) {
        console.log(`Duplicate image detected for ${file.originalname}, using existing photo ${existingPhoto._id}`);
        photoDocs.push(existingPhoto);
        continue;
      }

      const originalKey = `originals/${folder}/${Date.now()}-${file.originalname}`;
      await uploadToS3(file.buffer, originalKey, file.mimetype);
      console.log(`Uploaded to S3: ${originalKey}`);

      // Create tags array for search functionality
      const tags = [];
      if (propertyAddress && propertyAddress.trim()) {
        tags.push(propertyAddress.trim());
      }
      if (roomName && roomName.trim()) {
        tags.push(roomName.trim());
      }

      const photo = new Photo({
        userId,
        originalPath: originalKey,
        status: 'processing',
        imageHash: imageHash,
        fileSize: file.size,
        originalName: file.originalname,
        processingStartedAt: new Date(),
        propertyAddress: propertyAddress?.trim() || null,
        roomName: roomName?.trim() || null,
        tags: tags
      });
      await photo.save();
      console.log(`Saved photo to MongoDB: ${photo._id}`);
      photoDocs.push(photo);

      // Process async
      processPhoto(photo._id).catch(err => {
        console.error(`Error in processPhoto for ${photo._id}:`, err.message);
      });
    }

    res.json({ 
      msg: `Successfully submitted ${photoDocs.length} photo(s) for AI enhancement`, 
      photos: photoDocs 
    });
  } catch (err) {
    console.error('AI processing error:', err.message, err.stack);
    res.status(500).json({ msg: 'AI processing submission failed', error: err.message });
  }
});

// Get user photos
router.get('/', verifyToken, async (req, res) => {
  try {
    const photos = await Photo.find({ userId: req.user.id });
    console.log(`Fetched ${photos.length} photos for user: ${req.user.id}`);
    const photosWithUrls = await Promise.all(photos.map(async photo => ({
      ...photo.toObject(),
      originalUrl: await generatePresignedUrl(photo.originalPath),
      enhancedUrl: photo.enhancedPath ? await generatePresignedUrl(photo.enhancedPath) : null
    })));
    res.json(photosWithUrls);
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Function to process photo asynchronously
async function processPhoto(photoId) {
  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      console.error(`Photo not found: ${photoId}`);
      return;
    }

    // Check if already processing or done
    if (photo.status === 'done') {
      console.log(`Photo ${photoId} already processed, skipping`);
      return;
    }

    // Rate limiting: prevent multiple processing attempts too quickly
    const now = new Date();
    if (photo.lastProcessingAttempt) {
      const timeSinceLastAttempt = now - photo.lastProcessingAttempt;
      const minInterval = 30000; // 30 seconds minimum between attempts
      
      if (timeSinceLastAttempt < minInterval) {
        console.log(`Photo ${photoId} processing rate limited, skipping (${Math.ceil((minInterval - timeSinceLastAttempt) / 1000)}s remaining)`);
        return;
      }
    }

    // Update processing attempt tracking
    photo.lastProcessingAttempt = now;
    photo.status = 'processing';
    await photo.save();

    console.log(`Starting processing for photo ${photoId} (attempt #${photo.apiCallsMade + 1})`);

    const originalBuffer = await getFileFromS3(photo.originalPath);

    // Classify image (free operation, no rate limiting needed)
    const classification = await classifyImage(originalBuffer);
    photo.classification = classification;

    // Track API call before making it
    photo.apiCallsMade += 1;
    await photo.save();

    console.log(`Making Nano Banana API call #${photo.apiCallsMade} for photo ${photoId}`);

    try {
      // Enhance image (paid operation - this is where we save money by preventing duplicates)
      const enhancedBuffer = await enhanceImage(originalBuffer, classification, photo.roomName);
      
      // Upload enhanced image
      const enhancedKey = `enhanced/${photo.userId}/${photo.originalPath.split('/').pop()}`;
      await uploadToS3(enhancedBuffer, enhancedKey, 'image/png');

      // Mark as completed
      photo.enhancedPath = enhancedKey;
      photo.status = 'done';
      await photo.save();

      // Increment user's photosEnhanced counter
      const user = await User.findById(photo.userId);
      if (user && !user.isUnlimited) {
        user.photosEnhanced += 1;
        await user.save();
        console.log(`User ${photo.userId} has now enhanced ${user.photosEnhanced}/${user.photoCredits} photos`);
      }
      
      console.log(`Photo processed successfully: ${photoId} (${photo.apiCallsMade} API calls total)`);
    } catch (enhancementError) {
      console.error(`Enhancement failed for photo ${photoId}:`, enhancementError.message);
      
      // Don't upload anything as "enhanced" - leave enhancedPath as null
      // Mark photo status based on attempt count
      if (photo.apiCallsMade >= 3) {
        photo.status = 'error';
        console.log(`Photo ${photoId} marked as error after ${photo.apiCallsMade} failed enhancement attempts`);
      } else {
        photo.status = 'pending'; // Will be retried
        console.log(`Photo ${photoId} enhancement failed, will retry (attempt ${photo.apiCallsMade}/3)`);
      }
      await photo.save();
      
      // Re-throw to trigger the outer catch block for retry logic
      throw enhancementError;
    }
  } catch (err) {
    console.error(`Error processing photo ${photoId}:`, err.message);
    
    const photo = await Photo.findById(photoId);
    if (photo) {
      // Don't mark as error immediately - might be temporary issue
      // Only mark as error after multiple failed attempts
      if (photo.apiCallsMade >= 3) {
        photo.status = 'error';
        console.log(`Photo ${photoId} marked as error after ${photo.apiCallsMade} failed attempts`);
      } else {
        photo.status = 'pending'; // Will retry later
        console.log(`Photo ${photoId} will retry processing later (attempt ${photo.apiCallsMade}/3)`);
      }
      await photo.save();
    }
  }
}

// Get processing statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Photo.aggregate([
      { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalPhotos: { $sum: 1 },
          totalApiCalls: { $sum: '$apiCallsMade' },
          completedPhotos: { 
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          processingPhotos: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          pendingPhotos: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          errorPhotos: {
            $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
          },
          duplicatesDetected: {
            $sum: { $cond: [{ $and: [{ $ne: ['$imageHash', null] }, { $eq: ['$apiCallsMade', 0] }] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalPhotos: 0,
      totalApiCalls: 0,
      completedPhotos: 0,
      processingPhotos: 0,
      pendingPhotos: 0,
      errorPhotos: 0,
      duplicatesDetected: 0
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all unique addresses for a user
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Photo.distinct('propertyAddress', { 
      userId: userId,
      propertyAddress: { $ne: null, $ne: '' }
    });
    res.json(addresses.sort());
  } catch (err) {
    console.error('Error fetching addresses:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all unique rooms for a user (optionally filtered by address)
router.get('/rooms', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.query;
    
    const filter = { 
      userId: userId,
      roomName: { $ne: null, $ne: '' }
    };
    
    if (address) {
      filter.propertyAddress = address;
    }
    
    const rooms = await Photo.distinct('roomName', filter);
    res.json(rooms.sort());
  } catch (err) {
    console.error('Error fetching rooms:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update photo tags (bulk update)
router.put('/tags', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoIds, propertyAddress, roomName } = req.body;
    
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ msg: 'Photo IDs are required' });
    }
    
    // Create tags array
    const tags = [];
    if (propertyAddress && propertyAddress.trim()) {
      tags.push(propertyAddress.trim());
    }
    if (roomName && roomName.trim()) {
      tags.push(roomName.trim());
    }
    
    // Update multiple photos
    const result = await Photo.updateMany(
      { 
        _id: { $in: photoIds },
        userId: userId
      },
      {
        $set: {
          propertyAddress: propertyAddress?.trim() || null,
          roomName: roomName?.trim() || null,
          tags: tags,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({ 
      msg: `Updated ${result.modifiedCount} photos`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error updating photo tags:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Reprocess a photo with custom prompt
router.post('/reprocess/:photoId', verifyToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { customPrompt, sourceImage = 'enhanced' } = req.body;
    const userId = req.user.id;
    
    if (!customPrompt || !customPrompt.trim()) {
      return res.status(400).json({ msg: 'Custom prompt is required' });
    }
    
    // Find the photo
    const photo = await Photo.findOne({ _id: photoId, userId: userId });
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    
    console.log(`Reprocessing photo ${photoId} with custom prompt using ${sourceImage} image`);
    
    // Check photo credits for reprocessing (reprocessing counts as an enhancement)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }
    
    const remainingCredits = user.photoCredits - user.photosEnhanced;
    if (!user.isUnlimited && remainingCredits <= 0) {
      console.log(`User ${userId} has no credits remaining for reprocessing (${user.photosEnhanced}/${user.photoCredits})`);
      return res.status(403).json({ 
        msg: 'You have reached your photo enhancement limit. Please upgrade or use a registration code for more credits.',
        creditsUsed: user.photosEnhanced,
        creditsTotal: user.photoCredits
      });
    }
    
    // Get image buffer based on user choice
    const imagePath = sourceImage === 'original' ? photo.originalPath : photo.enhancedPath || photo.originalPath;
    const imageBuffer = await getFileFromS3(imagePath);
    
    // Track API call for reprocessing
    photo.apiCallsMade += 1;
    photo.status = 'processing';
    await photo.save();
    
    console.log(`Making Nano Banana API call #${photo.apiCallsMade} for photo ${photoId} (REPROCESS)`);
    
    try {
      // Use custom prompt for reprocessing
      const enhancedBuffer = await enhanceImage(imageBuffer, photo.classification, photo.roomName, customPrompt);
      
      // Create a new enhanced key with timestamp to avoid overwriting
      const timestamp = Date.now();
      const originalName = photo.originalPath.split('/').pop().split('.')[0];
      const enhancedKey = `enhanced/${userId}/${timestamp}-reprocessed-${originalName}.png`;
      
      await uploadToS3(enhancedBuffer, enhancedKey, 'image/png');
      
      // Update photo with new enhanced path
      photo.enhancedPath = enhancedKey;
      photo.status = 'done';
      await photo.save();

      // Increment user's photosEnhanced counter for reprocessing
      if (!user.isUnlimited) {
        user.photosEnhanced += 1;
        await user.save();
        console.log(`User ${userId} has now enhanced ${user.photosEnhanced}/${user.photoCredits} photos (via reprocessing)`);
      }
      
      console.log(`Photo reprocessed successfully: ${photoId} (${photo.apiCallsMade} API calls total)`);
      
      res.json({ 
        msg: 'Photo reprocessed successfully',
        photo: photo
      });
      
    } catch (enhancementError) {
      console.error(`Reprocessing enhancement failed for photo ${photoId}:`, enhancementError.message);
      
      // Mark photo status based on attempt count
      if (photo.apiCallsMade >= 3) {
        photo.status = 'error';
        console.log(`Photo ${photoId} marked as error after ${photo.apiCallsMade} failed reprocessing attempts`);
      } else {
        photo.status = 'done'; // Keep previous success but allow retry
        console.log(`Photo ${photoId} reprocessing failed, previous version still available`);
      }
      await photo.save();
      
      res.status(500).json({ 
        msg: 'Reprocessing failed', 
        error: enhancementError.message 
      });
    }
    
  } catch (err) {
    console.error('Reprocess error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;