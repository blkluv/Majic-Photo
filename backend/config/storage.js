const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: generateSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Determine if we're using local storage (MinIO) or cloud storage (Linode/AWS)
const isLocalStorage = process.env.S3_ENDPOINT?.includes('minio');
const isLinodeStorage = process.env.S3_ENDPOINT?.includes('linodeobjects.com');
const shouldUsePathStyle = isLocalStorage || isLinodeStorage;

const s3 = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: shouldUsePathStyle // Required for MinIO and Linode Object Storage
});

// Create separate client for public URL generation if needed
const publicS3 = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  },
  forcePathStyle: shouldUsePathStyle // Use same path style logic for consistency
});

const bucket = process.env.S3_BUCKET;

async function createUserFolder(folder) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `user/${folder}/`,
      Body: ''
    });
    await s3.send(command);
    console.log(`Created S3 folder: user/${folder}`);
  } catch (err) {
    console.error(`Error creating S3 folder user/${folder}:`, err.message);
    throw err;
  }
}

async function uploadToS3(buffer, key, contentType) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    });
    await s3.send(command);
    console.log(`Uploaded to S3: ${key}`);
  } catch (err) {
    console.error(`Error uploading to S3 ${key}:`, err.message);
    throw err;
  }
}

async function generatePresignedUrl(key) {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    // Use publicS3 client for URL generation to ensure browser-accessible URLs
    const url = await generateSignedUrl(publicS3, command, { expiresIn: 3600 });
    
    // Fix MinIO URLs for browser access
    let finalUrl = url;
    if (url.includes('minio:9000')) {
      // Replace with public IP - use env var if available, otherwise hardcode
      const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT 
        ? process.env.S3_PUBLIC_ENDPOINT.replace('http://', '').replace('https://', '')
        : '192.168.69.106:9000'; // Fallback to known IP
      
      finalUrl = url.replace('minio:9000', publicEndpoint);
      console.log(`URL fixed: minio:9000 -> ${publicEndpoint}`);
    }
    
    console.log(`Generated presigned URL for ${key}: ${finalUrl.substring(0, 100)}...`);
    return finalUrl;
  } catch (err) {
    console.error(`Error generating presigned URL for ${key}:`, err.message);
    throw err;
  }
}

async function getFileFromS3(key) {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);
    // Convert stream to buffer for compatibility
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    console.log(`Fetched from S3: ${key}`);
    return buffer;
  } catch (err) {
    console.error(`Error fetching from S3 ${key}:`, err.message);
    throw err;
  }
}

module.exports = { createUserFolder, uploadToS3, generatePresignedUrl, getFileFromS3 };