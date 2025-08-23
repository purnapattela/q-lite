const { randomUUID } = require('crypto');

class Job {
    constructor(data, options = {}) {
        this.id = randomUUID();
        this.data = data;

        this.status = 'pending'; // pending, delayed, active, completed, failed

        this.priority = options.priority || 0;
        this.attempts = options.attempts || 1;
        this.attemptsMade = 0;
        this.backoff = options.backoff || 0;

        this.delay = options.delay || 0;
        this.createdAt = Date.now();
        this.updatedAt = this.createdAt;
        this.finishedAt = null;

        this.progress = 0;
        this.logs = [];

        this._timeout = null;
        this._delayUntil = this.createdAt + this.delay;
    }

    get delayUntil() {
        return this._delayUntil;
    }

    setStatus(status) {
        this.status = status;
        this.updatedAt = Date.now();
    }

    log(message) {
        this.logs.push(`[${new Date().toISOString()}] ${message}`);
        this.updatedAt = Date.now();
    }

    setProgress(progress) {
        this.progress = Math.min(100, Math.max(0, progress));
        this.updatedAt = Date.now();
    }

    markCompleted() {
        this.setStatus('completed');
        this.finishedAt = Date.now();
    }

    markFailed(error) {
        this.setStatus('failed');
        this.log(`Failed: ${error}`);
        this.finishedAt = Date.now();
    }

    isReady() {
        return this.status === 'delayed' && Date.now() >= this._delayUntil;
    }

    toJSON() {
        return {
            id: this.id,
            data: this.data,
            status: this.status,
            priority: this.priority,
            attempts: this.attempts,
            attemptsMade: this.attemptsMade,
            backoff: this.backoff,
            delay: this.delay,
            delayUntil: this._delayUntil,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            finishedAt: this.finishedAt,
            progress: this.progress,
            logs: this.logs,
        };
    }
}

module.exports = Job;
