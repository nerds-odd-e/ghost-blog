import path from 'path';
import {migratePosts} from "./posts.js";
import {migrateImages} from "./images.js";

export default function main() {

  const outputDir = 'output';
  const options = {
    outputDir: outputDir,
    contentDir: path.join(outputDir, 'blog'),
    backupDir: process.argv[2] || '/Users/zbcjackson/Downloads/Movable_Type-2024-01-19-13-49-15-Backup/',
  }
  migratePosts(options);
  migrateImages(options);
}
