# Q-lite

A lightweight in-memory queue system mimicking RabbitMQ/BullMQ features — zero dependencies, simple API, built-in HTTP & WebSocket dashboard.

---

## Installation

```bash
npm install q-lite
```

---

## Usage

```js
const { createServer, registerProcessor } = require('q-lite');
const crypto = require('crypto');

const apiKey = crypto.randomBytes(16).toString('hex');

registerProcessor('emailQueue', async (jobData) => {
  console.log('Processing email job:', jobData);
  // simulate async work
  await new Promise(r => setTimeout(r, 2000));
});

createServer(apiKey, 3000);

console.log('API Key:', apiKey);
```

---

## API

### `createServer(apiKey, port)`

Starts the HTTP + WebSocket server with dashboard and REST API.

* `apiKey` (string): A secret key used to authenticate API requests.
* `port` (number): Port number to listen on.

### `registerProcessor(queueName, asyncProcessorFn)`

Registers an asynchronous job processor function for a specific queue.

* `queueName` (string): The name of the queue.
* `asyncProcessorFn` (function): An async function that receives the job data.

---

## Sending Jobs to Queues

Send HTTP POST requests to add jobs to queues.

Example with `curl`:

```bash
curl -X POST "http://localhost:3000/add/emailQueue?delay=5000&priority=10&attempts=5&backoff=2000" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-api-key>" \
  -d '{"to":"user@example.com","task":"send email"}'
```

---

## Dashboard

Open your browser and visit:

```
http://localhost:3000/
```

You’ll see a live dashboard of all queues and jobs with statuses like pending, delayed, active, completed, and failed.

---

## Features

* In-memory queue system, no external dependencies.
* Delayed jobs, priority, retry attempts, and backoff support.
* WebSocket-powered live dashboard.
* Simple REST API compatible with RabbitMQ/BullMQ concepts.
* Async job processors per queue.

---

## License

MIT License
