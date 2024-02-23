import fs from "fs";
import archiver from "archiver";
import tar from "tar";
import zlib from "zlib";
import { ensureDir } from "./dir.js";

export function createZipFile(options) {
  const outputPath = `${options.outputDir}/blog.zip`;
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip');

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log(`Zip file created: ${outputPath}`);
  });

  archive.on('error', function(err){
    throw err;
  });

  archive.pipe(output);

  archive.directory(options.contentDir, 'blog');

  archive.finalize();
}

export function extractArchive(options){
  console.log(`Extracting ${options.backupFile} to ${options.extractDir}`)
  ensureDir(options.extractDir)
  tar.extract({
    file: options.backupFile,
    cwd: options.extractDir,
    sync: true
  })
}