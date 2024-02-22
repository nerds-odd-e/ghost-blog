import fs from "fs";
import archiver from "archiver";

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