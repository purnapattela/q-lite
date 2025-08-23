const url = require('url');
const { StringDecoder } = require('string_decoder');
const queueManager = require('./queueManager');

function handleApiRequest(req, res, apiKey) {
    const parsed = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsed.pathname;

    if (pathname === '/status' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(queueManager.getQueueStatus()));
        return;
    }

    if (pathname.startsWith('/add/') && method === 'POST') {
        const providedKey = req.headers['x-api-key'];
        if (providedKey !== apiKey) {
            res.writeHead(403);
            return res.end('Forbidden');
        }

        const queueName = pathname.split('/')[2];
        const query = parsed.query;
        const decoder = new StringDecoder('utf-8');
        let body = '';

        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        req.on('end', () => {
            body += decoder.end();
            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.writeHead(400);
                return res.end('Invalid JSON');
            }

            const options = {
                delay: parseInt(query.delay) || 0,
                priority: parseInt(query.priority) || 0,
                attempts: parseInt(query.attempts) || 1,
                backoff: parseInt(query.backoff) || 0,
            };

            const queue = queueManager.getQueue(queueName);
            const job = queue.add(data, options);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: job.id }));
        });

        return;
    }

    res.writeHead(404);
    res.end('Not found');
}

module.exports = handleApiRequest;
