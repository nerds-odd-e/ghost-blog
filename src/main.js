import fs from "fs";
import path from 'path';
import {migratePosts} from "./posts.js";
import {migrateImages} from "./images.js";
import {createZipFile} from "./zip.js";

export default function main() {
  const outputDir = 'output';
  const options = {
    outputDir: outputDir,
    contentDir: path.join(outputDir, 'blog'),
    backupDir: process.argv[2] || '/Users/zbcjackson/Downloads/Movable_Type-2024-01-19-13-49-15-Backup/',
    host: process.env.NODE_ENV === 'production' ? 'https://b.odd-e.com' : 'http://localhost:8080'
  }
  cleanOutputDir(options);

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
