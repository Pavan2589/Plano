const Minio = require('minio');
const env = require('./env');

const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: false, // Local compose setup is HTTP
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY
});

const REQUIRED_BUCKETS = [
  'shelf-images',
  'reference-products',
  'annotated-results',
  'reference-planograms'
];

async function initializeMinio() {
  console.log('Initializing MinIO buckets...');
  for (const bucket of REQUIRED_BUCKETS) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`Bucket "${bucket}" created successfully.`);
      } else {
        console.log(`Bucket "${bucket}" already exists.`);
      }

      // Configure read-only policy for public access (required for frontend rendering and python cv service retrieval)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`]
          }
        ]
      };
      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      console.log(`Public read policy applied to bucket "${bucket}".`);
    } catch (err) {
      console.error(`Error checking/creating bucket "${bucket}":`, err.message);
      throw err;
    }
  }
}

module.exports = {
  minioClient,
  initializeMinio,
  REQUIRED_BUCKETS
};
