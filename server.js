const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const { createReadStream } = require('fs');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_PATH = path.join(ROOT_DIR, 'src', 'data', 'countries.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

async function serveCountries(response) {
  try {
    const fileContents = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(fileContents);

    if (!Array.isArray(data?.countries)) {
      throw new Error('Invalid countries payload.');
    }

    response.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    response.end(JSON.stringify({ countries: data.countries }));
  } catch (error) {
    console.error('Error loading countries data:', error);
    response.writeHead(500, { 'Content-Type': MIME_TYPES['.json'] });
    response.end(JSON.stringify({ error: 'Unable to load country data.' }));
  }
}

async function resolveFilePath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const trimmedPath = decodedPath.replace(/^\/+/, '');
  const relativePath = trimmedPath === '' ? 'index.html' : trimmedPath;
  const normalisedPath = path.normalize(relativePath);
  const absolutePath = path.join(ROOT_DIR, normalisedPath);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    return { status: 403 };
  }

  try {
    const stats = await fs.stat(absolutePath);
    if (stats.isDirectory()) {
      return { filePath: path.join(absolutePath, 'index.html') };
    }

    return { filePath: absolutePath };
  } catch (error) {
    const hasExtension = path.extname(relativePath) !== '';
    if (!hasExtension) {
      return { filePath: path.join(ROOT_DIR, 'index.html') };
    }

    return { status: 404 };
  }
}

async function serveStaticAsset(filePath, response) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || 'application/octet-stream';

  try {
    const stream = createReadStream(filePath);
    stream.on('open', () => {
      response.writeHead(200, { 'Content-Type': contentType });
    });
    stream.pipe(response);
    stream.on('error', () => {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
      response.end('Internal Server Error');
    });
  } catch (error) {
    console.error('Error serving asset:', error);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
    response.end('Internal Server Error');
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { pathname } = url;

  if (request.method === 'GET' && pathname === '/api/countries') {
    await serveCountries(response);
    return;
  }

  const { filePath, status } = await resolveFilePath(pathname);

  if (status) {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=UTF-8' });
    response.end(status === 403 ? 'Forbidden' : 'Not Found');
    return;
  }

  await serveStaticAsset(filePath, response);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
