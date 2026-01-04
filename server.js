const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const CONTEXT_PATH = '/jmh-report-visualizer';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.map': 'application/json'
};

const server = http.createServer((req, res) => {
    // Handle Redirect from root
    if (req.url === '/') {
        res.writeHead(301, { 'Location': CONTEXT_PATH + '/' });
        res.end();
        return;
    }

    // Check if request is for our context path
    if (!req.url.startsWith(CONTEXT_PATH)) {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    // Normalize path
    let relativePath = req.url.substring(CONTEXT_PATH.length);
    if (relativePath === '' || relativePath === '/') {
        relativePath = '/index.html';
    }

    // Remove query string
    const queryIndex = relativePath.indexOf('?');
    if (queryIndex !== -1) {
        relativePath = relativePath.substring(0, queryIndex);
    }

    // Safe path resolution
    // Prevent directory traversal by using path.normalize and checking prefix
    const safeRelativePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(DIST_DIR, safeRelativePath);

    // Security check: ensure we are still inside DIST_DIR
    if (!filePath.startsWith(DIST_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server started`);
});

// Handle SIGINT (Ctrl+C) and SIGTERM (Docker stop)
const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down server...`);
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
