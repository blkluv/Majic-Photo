const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

async function initMinio() {
  // Only run in development with MinIO
  if (!process.env.S3_ENDPOINT?.includes('minio')) {
    console.log('Not using MinIO, skipping bucket initialization');
    return;
  }

  const s3 = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    },
    forcePathStyle: true
  });

  const bucket = process.env.S3_BUCKET;

  try {
    // Check if bucket exists
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`Bucket ${bucket} already exists`);
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) {
      // Bucket doesn't exist, create it
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`Created bucket: ${bucket}`);
      } catch (createError) {
        console.error(`Error creating bucket ${bucket}:`, createError.message);
      }
    } else {
      console.error(`Error checking bucket ${bucket}:`, error.message);
    }
  }
}

module.exports = { initMinio };