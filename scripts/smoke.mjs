import http from 'node:http';
import handler from '../api/index.js';

const port = 4321;
const server = http.createServer((request, response) => handler(request, response));

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});

try {
  const response = await fetch(`http://127.0.0.1:${port}/`);
  const html = await response.text();

  if (response.status !== 200) {
    throw new Error(`Expected GET / to return 200, received ${response.status}: ${html.slice(0, 500)}`);
  }

  if (!html.includes('<!DOCTYPE html>')) {
    throw new Error('GET / did not return the rendered HTML document.');
  }

  console.log(`Vercel handler smoke test passed (${response.status}, ${html.length} bytes).`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
