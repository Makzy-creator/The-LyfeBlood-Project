import { parentPort } from 'worker_threads';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

parentPort.on('message', async (msg) => {
  const { password, salt, keylen, options } = msg;
  try {
    const derived = await scryptAsync(password, salt, keylen, options || {});
    parentPort.postMessage({ derived: derived.toString('hex') });
  } catch (err) {
    parentPort.postMessage({ error: String(err && err.message ? err.message : err) });
  }
});
