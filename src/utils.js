const crypto = require('crypto');

function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    generateToken,
    delay
};
