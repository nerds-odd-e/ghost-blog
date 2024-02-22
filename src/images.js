import fs from "fs";
import path from "path";
import {ensureDir} from "./dir.js";

export function migrateImages(options) {
  const imageDir = path.join(options.contentDir, 'content', 'images');
  ensureDir(imageDir);
  fs.readdir(options.backupDir, (err, files) => {
    if (err) return console.error(err);
    files.filter(imagesWithoutThumb).forEach((file) => {
      const sourcePath = path.join(options.backupDir, file)
      let newFileName = updateFileName(file);
      const destinationPath = path.join(imageDir, newFileName)
      fs.copyFileSync(sourcePath, destinationPath);
    })
  })
}

export function imagesWithoutThumb(file) {
  return (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) && (file.match(/-thumb-/g) == null);
}

export function updateFileName(file) {
  const {name, ext} = path.parse(file)
  let newName = name.replace(/^\d{1,4}-/, '');
  newName = newName.replace(/^\W/g, '');
  newName = newName.replace(/([&-]|\s)+/g, '-');
  newName = newName.replace(/\.-/g, '-');
  return `${newName}${ext}`
}
