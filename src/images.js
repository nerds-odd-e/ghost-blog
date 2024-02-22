import fs from "fs";
import path from "path";
import {ensureDir} from "./dir.js";

export function migrateImages(options) {
  const imageDir =  path.join(options.contentDir, 'content', 'images');
  ensureDir(imageDir);
  fs.readdir(options.backupDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach((file) => {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
        const sourcePath = path.join(options.backupDir, file)
        const newFileName = file.replace(/^\d{1,4}-/, '');
        const destinationPath = path.join(imageDir, newFileName)
        fs.copyFileSync(sourcePath, destinationPath);
      }
    })
  })
}
