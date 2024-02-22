import fs from "fs";
import path from "path";

export function migrateImages(options) {

}

function renameImages(backupDir) {
  fs.readdir(backupDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach((file) => {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
        const new_file = file.replace(/^\d{1,4}-/, '');
        const orig_path = path.join(backupDir, file)
        const new_file_path = path.join(backupDir, new_file)
        fs.rename(orig_path, new_file_path, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(orig_path, '->', new_file_path);
          }
        });
      }
    })
  })
}
