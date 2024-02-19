import lexical from 'lexical';
const {$getRoot, $getSelection} = lexical;
import lexicalHeadless from '@lexical/headless';
const {createHeadlessEditor} = lexicalHeadless;
import lexicalHtml from '@lexical/html';
const {$generateNodesFromDOM} = lexicalHtml;
import jsdom from 'jsdom';
const {JSDOM} = jsdom;
import lodash from 'lodash';
const {unescape} = lodash;
import xml from 'xml2js';
import fs from 'fs';

main();

function main() {
  const path = '/Users/zbcjackson/Downloads/Movable_Type-2024-01-19-13-49-15-Backup/Movable_Type-2024-01-19-13-48-55-Backup-1.xml';
  const content = loadContent(path);
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
  console.log(json);

  fs.writeFileSync('blog.json', json, 'utf8');
}


function htmlToLexicalString(htmlString) {
  const editorNodes = [] // Any custom nodes you register on the editor
  const editor = createHeadlessEditor({ nodes: editorNodes });
  const dom = new JSDOM(htmlString);
  let parsingError = null;
  editor.update(() => {
    // In a headless environment you can use a package such as JSDom to parse the HTML string.

    // Once you have the DOM instance it's easy to generate LexicalNodes.
    const nodes = $generateNodesFromDOM(editor, dom.window.document);

    // Select the root
    $getRoot().select();

    // Insert them at a selection.
    const selection = $getSelection();
    if (selection) {
      try {
        selection.insertNodes(nodes);
      } catch (err) {
        parsingError = err;
      }
    }

  }, { discrete: true });
  if (parsingError) {
    throw parsingError;
  }
  const editorState = editor.getEditorState();
  const json = editorState.toJSON();
  
  
  const result = JSON.stringify(json);
  return result;
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
      post.lexical = htmlToLexicalString(entry.text[0]);
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
