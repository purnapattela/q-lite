const Queue = require('./queue');

class QueueManager {
    constructor() {
        this.queues = new Map();
    }

    getQueue(name) {
        if (!this.queues.has(name)) {
            this.queues.set(name, new Queue(name));
        }
        return this.queues.get(name);
    }

    getAllQueues() {
        return Array.from(this.queues.values());
    }

    getQueueStatus() {
        return this.getAllQueues().map(queue => ({
            name: queue.name,
            counts: queue.getCounts(),
            jobs: queue.getAllJobs()
        }));
    }
}

module.exports = new QueueManager();
