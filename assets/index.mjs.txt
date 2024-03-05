import http from 'http';
import crypto from 'crypto';
import fs from 'fs';

const host = 'localhost';
const port = 8081;

const requestListener = (req, res) => {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    try {
      body = Buffer.concat(body).toString();
      const content = JSON.parse(body);
      content.forEach(saveData);
    } catch(e) {
      console.error(e);
    }
    res.writeHead(200);
    res.end("");
  });
};

// - Sorting files by name should preserve order in which the data arrived
// - Files should have unique names
const getFilename = (content) => {
  const shortHash = crypto.createHash('sha256').update(content).digest('hex').substring(0,4);
  const timestamp = String(Date.now()).padStart(16, '0');
  return `${timestamp}-${shortHash}`
}

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

const saveData = (data) => {
  const type = data.type;
  ensureDir('../data');
  ensureDir('../data/sync');
  ensureDir(`../data/sync/${type}`);

  const content = JSON.stringify(data, undefined, "  ");
  const filename = `../data/sync/${type}/${getFilename(content)}.json`;
  fs.writeFileSync(filename, content);
  console.info(`Saved ${filename}`);
}

const server = http.createServer(requestListener);
server.listen(port, host, () => console.log(`Server running on http://${host}:${port}`));
