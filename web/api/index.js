import { handle } from '@hono/node-server/vercel';

let runtimeHandlerPromise;

function getMissingRequiredEnvironmentVariables() {
  const required = ['DATABASE_URL', 'AUTH_SECRET'];
  return required.filter((name) => !process.env[name]?.trim());
}

export default async function vercelHandler(request, response) {
  const missing = getMissingRequiredEnvironmentVariables();

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    response.statusCode = 503;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(
      JSON.stringify({
        error: 'Server configuration is incomplete.',
        missing,
      })
    );
    return;
  }

  runtimeHandlerPromise ??= import('../build/server/index.js').then(({ default: app }) => {
    if (!app || typeof app.fetch !== 'function') {
      throw new TypeError('The production server build did not export a valid Hono application.');
    }
    return handle(app);
  });

  const runtimeHandler = await runtimeHandlerPromise;
  return runtimeHandler(request, response);
}
