import AWS from 'aws-sdk';
import fs from "fs";
import path from "path";

function s3(options) {
  const s3Options = {
    bucket: options.s3.bucket,
    region: options.s3.region,
    signatureVersion: 'v4',
    s3ForcePathStyle: false,
    credentials: new AWS.Credentials(options.s3.accessKeyId, options.s3.secretAccessKey),
    endpoint: options.s3.endpoint
  }
  return new AWS.S3(s3Options)
}

function put(sourcePath, destinationPath, options) {
  const file = fs.readFileSync(sourcePath);
  let config = {
    ACL: 'public-read',
    Body: file,
    Bucket: options.s3.bucket,
    CacheControl: `max-age=${30 * 24 * 60 * 60}`,
    ContentType: `image/${path.extname(sourcePath).replace('.', '')}`,
    Key: destinationPath,
  }
  s3(options)
    .putObject(config, (err, data) => err? console.error(err) : console.log(`${options.s3.assetHost}/${destinationPath}`));
}

function exists(filePath, options, callback) {
  s3(options)
    .getObject({
      Bucket: options.s3.bucket,
      Key: filePath
    }, (err) => err ? callback(false) : callback(true))
}

export function uploadIfNotExists(sourcePath, destinationPath, options) {
  exists(destinationPath, options, (exists) => {
    if (!exists) {
      put(sourcePath, destinationPath, options)
    }
  })
}