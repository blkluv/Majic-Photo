require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const { initMinio } = require('./init-minio');

const app = express();

// Configure CORS based on environment
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from majic-photo.com, localhost, and direct IP access
    const allowedOrigins = [
      'https://majic-photo.com',
      'https://www.majic-photo.com',
      'http://localhost:3000',
      'http://192.168.69.106:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, allow all origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize MinIO bucket if needed
initMinio().catch(err => console.error('MinIO initialization error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err.message); // Send error message for debugging
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});