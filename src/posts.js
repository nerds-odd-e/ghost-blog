import fs from "fs";
import path from "path";
import xml from "xml2js";
import {ensureDir} from "./dir.js";

export function migratePosts(options) {
  const originalData = loadMovableTypeData(options.extractDir);
  let blog = generateGhostData(originalData, options);
  writeToJsonFile(blog, options.contentDir);
}

function findXmlFile(backupDir) {
  const xmlFileName = fs.readdirSync(backupDir).filter(fn => fn.endsWith('.xml') && fn.startsWith('Movable_Type'))[0];
  return path.join(backupDir, xmlFileName);
}

function fixPostLinks(blog, options) {
  var postUrls = [];
  for (let post of blog.data.posts) {
    var url = post.title.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    var slug = url.replace(/-+/g, '-').replace(/^-|-$/g, '');
    var postUrl = {id: post.id, slug, url};
    postUrls.push(postUrl);
  }
  for (let post of blog.data.posts) {
    post.html = post.html.replace(new RegExp(`href="${options.host}/([^<>/ ]*?)"`, "g"), (match, title) => {
      var postUrl = postUrls.find(pu => pu.slug === title.replace(/-+/g, '-'));
      if (postUrl) {
        return `href="${options.host}/${postUrl.url}"`;
      }
      console.warn(match);
      return match;
    });
  }
}

function generateGhostData(content, options) {
  let blog = {
    "meta": {
      "exported_on": 1388805572000,
      "version": "5.76.0"
    },
    "data": {
      "posts": [],
      "posts_authors": [],
      "users": [],
    }
  };
  blog.data = extractData(content, options);
  fixPostLinks(blog, options);
  return blog;
}

function loadMovableTypeData(backupDir) {
  let xmlFilePath = findXmlFile(backupDir);
  return loadContent(xmlFilePath);
}

function writeToJsonFile(blog, outputContentDir) {
  const json = JSON.stringify(blog, null, 2);
  ensureDir(outputContentDir);
  fs.writeFileSync(path.join(outputContentDir, 'blog.json'), json, 'utf8');
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

export function processHtml(html, options) {
  let assetUrlRegex = /"http(s?):\/\/blog.odd-e.com\/([\w\/]*)\/(.*?)(-thumb.*?)?\.(\w+?)"/g;
  return html.replace(assetUrlRegex, (match, https, path, filename, thumb, ext) => {
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return `"${options.s3.assetHost}/content/images/${filename.replace(/(%\d\d)+/g, '-').replace(/\.?-+/g, '-')}.${ext}"`;
      case 'html':
        return `"${options.host}/${filename}"`;
      default:
        console.warn(`Unknown file type: ${ext}`);
        return match;
    }
  });
}

function extractData(content, options) {
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
      post.html = processHtml(entry.text[0], options);
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
