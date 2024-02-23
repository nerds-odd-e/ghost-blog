import fs from "fs";
import path from 'path';
import {migratePosts} from "./posts.js";
import {migrateImages} from "./images.js";
import {createZipFile, extractArchive} from "./zip.js";

export default function main() {
  const outputDir = 'output';
  const options = {
    outputDir: outputDir,
    contentDir: path.join(outputDir, 'blog'),
    extractDir: path.join(outputDir, 'extracted'),
    backupFile: process.argv[2],
    host: process.env.NODE_ENV === 'production' ? 'https://b.odd-e.com' : 'http://localhost:8080'
  }
  cleanOutputDir(options);
  extractArchive(options);

  migratePosts(options);
  migrateImages(options);

  createZipFile(options);
}

function cleanOutputDir(options) {
  const outputDir = options.outputDir;
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir);
}
