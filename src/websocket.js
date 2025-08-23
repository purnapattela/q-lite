const clients = new Set();

function setupWebSocket(server) {
    server.on('upgrade', (req, socket) => {
        const key = req.headers['sec-websocket-key'];
        if (!key) {
            socket.destroy();
            return;
        }

        const acceptKey = generateAcceptValue(key);
        const headers = [
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${acceptKey}`,
            '', ''
        ];

        socket.write(headers.join('\r\n'));
        clients.add(socket);

        socket.on('end', () => clients.delete(socket));
        socket.on('close', () => clients.delete(socket));
        socket.on('error', () => clients.delete(socket));
    });
}

function generateAcceptValue(key) {
    const crypto = require('crypto');
    return crypto
        .createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
        .digest('base64');
}

function broadcast(message) {
    const data = encodeMessage(JSON.stringify(message));
    for (const client of clients) {
        client.write(data);
    }
}

function encodeMessage(str) {
    const json = Buffer.from(str);
    const length = json.length;
    const buffer = [];

    buffer.push(0x81);

    if (length < 126) {
        buffer.push(length);
    } else if (length < 65536) {
        buffer.push(126, (length >> 8) & 255, length & 255);
    } else {
        buffer.push(
            127, 0, 0, 0, 0,
            (length >> 24) & 255,
            (length >> 16) & 255,
            (length >> 8) & 255,
            length & 255
        );
    }

    return Buffer.concat([Buffer.from(buffer), json]);
}

module.exports = {
    setupWebSocket,
    broadcast
};
