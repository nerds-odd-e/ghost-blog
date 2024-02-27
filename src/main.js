import fs from "fs";
import path from 'path';
import dotenv from 'dotenv';
import {migratePosts} from "./posts.js";
import {migrateImages} from "./images.js";
import {createZipFile, extractArchive} from "./zip.js";

const env = process.env.NODE_ENV;
dotenv.config({ path: path.resolve(process.cwd(), `.env${env ? `.${env}` : ""}`) });

export default function main() {
  const outputDir = 'output';
  const options = {
    outputDir: outputDir,
    contentDir: path.join(outputDir, 'blog'),
    extractDir: path.join(outputDir, 'extracted'),
    backupFile: process.argv[2],
    host: process.env.BLOG_HOST,
    s3: {
      bucket: process.env.BLOG_STORAGE_BUCKET,
      region: process.env.BLOG_STORAGE_REGION,
      accessKeyId: process.env.BLOG_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.BLOG_STORAGE_SECRET_ACCESS_KEY,
      endpoint: process.env.BLOG_STORAGE_ENDPOINT,
      assetHost: process.env.BLOG_STORAGE_ASSET_HOST
    }
  }
  cleanOutputDir(options);
  extractArchive(options);

  migratePosts(options);
  migrateImages(options);
}

function cleanOutputDir(options) {
  const outputDir = options.outputDir;
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir);
}
