const { createServer } = require('./dashboardServer');
const queueManager = require('./queueManager');

function registerProcessor(queueName, processorFn) {
    const queue = queueManager.getQueue(queueName);
    queue.process(processorFn);
}

module.exports = {
    createServer,
    registerProcessor
};
