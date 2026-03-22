const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function upload(bucket, key, body, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType || undefined,
  }));
}

async function listObjects(bucket) {
  const data = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
  return data.Contents || [];
}

async function getDownloadUrl(bucket, key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

async function getObject(bucket, key) {
  const data = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return { body: data.Body, contentType: data.ContentType };
}

async function deleteObject(bucket, key) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

module.exports = {
  upload,
  listObjects,
  getDownloadUrl,
  getObject,
  deleteObject,
};
