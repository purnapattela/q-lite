const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const handleApiRequest = require('./api');
const { setupWebSocket, broadcast } = require('./websocket');
const queueManager = require('./queueManager');

function createServer(apiKey, port = 9999) {
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url);

        if (parsedUrl.pathname.startsWith('/add') || parsedUrl.pathname === '/status') {
            return handleApiRequest(req, res, apiKey);
        }

        if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
            const filePath = path.join(__dirname, '..', 'public', 'index.html');
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading UI');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
            return;
        }

        res.writeHead(404);
        res.end('Not Found');
    });

    setupWebSocket(server);

    setInterval(() => {
        const status = queueManager.getQueueStatus();
        broadcast(status);
    }, 1000);

    server.listen(port, () => {
        console.log(`Q-lite server running on http://localhost:${port}`);
        console.log(`API Key: ${apiKey}`);
    });

    return server;
}

module.exports = { createServer };
