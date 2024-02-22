import xml from 'xml2js';
import fs from 'fs';
import path from 'path';

main();

function main() {

  const backupDir = process.argv[2] || '/Users/zbcjackson/Downloads/Movable_Type-2024-01-19-13-49-15-Backup/';
  //Movable_Type-2024-01-19-13-48-55-Backup-1.xml

  const xmlfile = fs.readdirSync(backupDir).filter(fn => fn.endsWith('.xml') && fn.startsWith('Movable_Type'))[0];
  const content = loadContent(path.join(backupDir,xmlfile));
  let blog = {
    "meta":{
      "exported_on":  1388805572000,
      "version":      "5.76.0"
    },
    "data":{
      "posts": [],
      "posts_authors": [],
      "users": [],
    }
  };
  blog.data = extractData(content);

  const json = JSON.stringify(blog, null, 2);

  fs.writeFileSync('blog.json', json, 'utf8');

  //renameImages(path.dirname(backupDir));
}


function convertTimeFormat(time) {
  const year = time.substr(0, 4);
  const month = time.substr(4, 2);
  const day = time.substr(6, 2);
  const hour = time.substr(8, 2);
  const minute = time.substr(10, 2);
  const second = time.substr(12, 2);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
}

function loadContent(path) {
  return fs.readFileSync(path, 'utf8');
}

export function processHtml(html) {
  let assetUrlRegex = /"http(s?):\/\/blog.odd-e.com\/([\w\/]*)\/(.*?)(-thumb.*?)?\.(.*?)"/g;
  return html.replace(assetUrlRegex, (match, https, path, filename, thumb, ext) => `"https://localhost:8080/content/images/${filename.replace(/(%\d\d)+/g, '-')}.${ext}"`);
}

function extractData(content) {
  let data = {
    posts: [],
    posts_authors: [],
    users: [
      {
        id: '9',
        name: 'Lv Yi',
        email: 'yi.lv@odd-e.com',
        created_at: '2012-01-19T13:49:15.000Z',
      }
    ],
  };
  const parser = new xml.Parser();
  parser.parseString(content, (err, result) => {
    for (let entry of result.movabletype.entry) {
      let post = {};
      post.id = entry.$.id;
      post.title = entry.$.title;
      post.status = "published";
      post.published_at = convertTimeFormat(entry.$.authored_on);
      // post.lexical = htmlToLexicalString(entry.text[0]);
      post.html = processHtml(entry.text[0]);
      data.posts.push(post);

      let user = data.users.find((user) => user.id === entry.$.author_id);
      if (!user) {
        let author = result.movabletype.author.find((author) => author.$.id === entry.$.author_id);
        user = {};
        user.id = author.$.id;
        user.name = author.$.nickname;
        user.email = author.$.email;
        user.created_at = convertTimeFormat(author.$.created_on);
        data.users.push(user);
      }

      let post_author = {};
      post_author.post_id = post.id;
      post_author.author_id = user.id;
      data.posts_authors.push(post_author);
    }
  });
  return data;
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
