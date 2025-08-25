# Q-lite

A lightweight in-memory job queue system inspired by RabbitMQ/BullMQ with zero dependencies, asynchronous processing, and a built-in live dashboard.


## Introduction

`Q-lite` is designed to provide simple yet powerful job queue functionality without external dependencies like Redis. It supports delayed jobs, job prioritization, retry attempts with backoff, and provides a real-time dashboard via WebSocket.

---

## Installation

```bash
npm install @purnapattela/q-lite
```

---

## Quick Start

```js
const { createServer, registerProcessor } = require('@purnapattela/q-lite');
const crypto = require('crypto');

const apiKey = crypto.randomBytes(16).toString('hex');

registerProcessor('emailQueue', async (jobData) => {
  console.log('Processing job:', jobData);
  // simulate async work
  await new Promise(resolve => setTimeout(resolve, 2000));
});

createServer(apiKey, 3000);

console.log('API Key:', apiKey);
```

Start the server and processor. Use the printed API key to submit jobs.

---

## API Reference

### `createServer(apiKey, port)`

Starts the HTTP and WebSocket server for job submission and live dashboard.

* **Parameters:**

  * `apiKey` *(string)*: Secret key for API request authentication.
  * `port` *(number)*: Port number to listen on (default: 3000).

* **Returns:**
  HTTP server instance.

---

### `registerProcessor(queueName, processorFn)`

Registers an asynchronous job processor function for the named queue.

* **Parameters:**

  * `queueName` *(string)*: Name of the queue.
  * `processorFn` *(async function)*: Function that receives job data and processes it.

* **Usage:**
  The processor function is called with job data whenever a job is dequeued.

---

## REST API

### Add Job

```
POST /add/:queueName
```

* **Headers:**

  * `Content-Type: application/json`
  * `x-api-key: <your-api-key>`

* **Query Parameters (optional):**

  * `delay` *(ms)*: Delay before the job becomes active.
  * `priority` *(integer)*: Job priority (higher number = higher priority).
  * `attempts` *(integer)*: Number of retry attempts on failure.
  * `backoff` *(ms)*: Delay between retry attempts.

* **Body:**
  JSON object with any job-specific data.

* **Example:**

```bash
curl -X POST "http://localhost:3000/add/emailQueue?delay=5000&priority=10&attempts=3&backoff=2000" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"to":"user@example.com","task":"send email"}'
```

---

### Get Status

```
GET /status
```

Returns a JSON summary of all queues and counts of jobs by their status (pending, delayed, active, completed, failed).

---

## Job Options

When submitting jobs, you can control job behavior via query parameters:

| Option   | Type    | Description                             | Default |
| -------- | ------- | --------------------------------------- | ------- |
| delay    | number  | Delay in milliseconds before processing | 0       |
| priority | integer | Job priority, higher is processed first | 0       |
| attempts | integer | Number of retry attempts on failure     | 1       |
| backoff  | number  | Delay in ms between retries             | 0       |

---

## Dashboard

Open your browser at:

```
http://localhost:<port>/
```

The dashboard shows:

* List of queues.
* Jobs grouped by status:

  * Pending
  * Delayed
  * Active
  * Completed
  * Failed
* Real-time updates via WebSocket.
* Details of each job including data, attempts, delay, priority.

---

## Examples

### Registering a processor

```js
registerProcessor('emailQueue', async (jobData) => {
  console.log('Sending email to:', jobData.to);
  await new Promise(r => setTimeout(r, 1000));
});
```

### Adding jobs with different options

```bash
curl -X POST "http://localhost:3000/add/emailQueue?delay=3000&priority=5" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"to":"user1@example.com","task":"send welcome email"}'
```

---

## FAQ

**Q: Does `q-lite` persist jobs?**
A: No, it is an in-memory queue and all data is lost on restart.

**Q: Can I use multiple processors?**
A: Yes, register processors for different queues by name.

**Q: Is it compatible with BullMQ or RabbitMQ?**
A: It mimics many features but uses a different underlying implementation.
