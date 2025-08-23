const Job = require('./job');

class Queue {
    constructor(name) {
        this.name = name;
        this.jobs = [];
        this.processor = null;
        this.running = false;
    }

    add(data, options = {}) {
        const job = new Job(data, options);

        if (job.delay > 0) {
            job.setStatus('delayed');
        }

        this.jobs.push(job);
        this.jobs.sort((a, b) => b.priority - a.priority);

        return job;
    }

    process(fn) {
        this.processor = fn;
        if (!this.running) {
            this.running = true;
            this._startProcessing();
        }
    }

    getJobsByStatus(status) {
        return this.jobs.filter(job => job.status === status);
    }

    getCounts() {
        return {
            pending: this.jobs.filter(j => j.status === 'pending').length,
            delayed: this.jobs.filter(j => j.status === 'delayed').length,
            active: this.jobs.filter(j => j.status === 'active').length,
            completed: this.jobs.filter(j => j.status === 'completed').length,
            failed: this.jobs.filter(j => j.status === 'failed').length,
        };
    }

    getAllJobs() {
        return this.jobs.map(job => job.toJSON());
    }

    async _startProcessing() {
        while (this.running) {
            const readyDelayed = this.jobs.filter(j => j.status === 'delayed' && j.isReady());
            readyDelayed.forEach(j => j.setStatus('pending'));

            const nextJob = this.jobs.find(j => j.status === 'pending');

            if (!nextJob) {
                await new Promise(r => setTimeout(r, 100));
                continue;
            }

            nextJob.setStatus('active');
            nextJob.attemptsMade++;

            try {
                if (this.processor) {
                    await this.processor(nextJob.data, {
                        updateProgress: p => nextJob.setProgress(p)
                    });
                }
                nextJob.markCompleted();
            } catch (err) {
                if (nextJob.attemptsMade < nextJob.attempts) {
                    nextJob.setStatus('delayed');
                    nextJob._delayUntil = Date.now() + nextJob.backoff;
                    nextJob.log(`Retrying after backoff: ${nextJob.backoff}ms`);
                } else {
                    nextJob.markFailed(err.message || String(err));
                }
            }
        }
    }
}

module.exports = Queue;
