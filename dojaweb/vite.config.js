import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'url';
import process from 'node:process';
import { Buffer } from 'node:buffer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'PEXELS_']);
  const pexelsApiKey = env.PEXELS_API_KEY || env.VITE_PEXELS_API_KEY || '';
  const backendUrl = env.VITE_BACKEND_URL || '';

  console.log('[pexels-dev-proxy] PEXELS_API_KEY loaded:', Boolean(pexelsApiKey));

  return {
    plugins: [
      react(),
      {
        name: 'pexels-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/pexels', async (req, res) => {
            try {
              if (!pexelsApiKey) {
                res.statusCode = 500;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing PEXELS_API_KEY in .env' }));
                return;
              }

              const targetUrl = `https://api.pexels.com${req.url || ''}`;
              const upstream = await fetch(targetUrl, {
                headers: {
                  Authorization: pexelsApiKey,
                  Accept: 'application/json',
                  'Accept-Encoding': 'identity',
                  'User-Agent': 'dojaweb-vite-proxy',
                },
                cache: 'no-store',
              });

              const buf = Buffer.from(await upstream.arrayBuffer());

              if (!upstream.ok) {
                const bodyText = new TextDecoder('utf-8').decode(buf).slice(0, 500);
                const headers = {};
                upstream.headers.forEach((value, key) => {
                  headers[key] = value;
                });
                console.error('[pexels-dev-proxy] upstream non-2xx', {
                  status: upstream.status,
                  url: targetUrl,
                  body: bodyText.slice(0, 500),
                  headers,
                });
              }

              res.statusCode = upstream.status;
              upstream.headers.forEach((value, key) => {
                // Avoid sending back problematic hop-by-hop headers.
                if (key.toLowerCase() === 'transfer-encoding') return;
                // Node's fetch may transparently decompress but preserve headers.
                // Avoid sending encoding/length headers to the browser to prevent decode failures.
                if (key.toLowerCase() === 'content-encoding') return;
                if (key.toLowerCase() === 'content-length') return;
                res.setHeader(key, value);
              });

              res.end(buf);
            } catch (err) {
              console.error('[pexels-dev-proxy] fetch failed', {
                message: err?.message,
                code: err?.code,
              });
              res.statusCode = 502;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ error: 'Pexels request failed', message: err?.message, code: err?.code }));
            }
          });

          if (!backendUrl) return;

          server.middlewares.use('/api', async (req, res, next) => {
            try {
              const url = req?.url || '';
              if (url.startsWith('/pexels')) {
                next();
                return;
              }

              const base = backendUrl.replace(/\/$/, '');
              const targetUrl = `${base}${url}`;
              const fallbackUrl = `${base}/api${url}`;

              const headers = { ...req.headers };
              delete headers.host;
              headers['accept-encoding'] = 'identity';

              let body;
              const method = String(req.method || 'GET').toUpperCase();
              if (!['GET', 'HEAD'].includes(method)) {
                const chunks = [];
                for await (const chunk of req) chunks.push(chunk);
                body = Buffer.concat(chunks);
              }

              let upstream = await fetch(targetUrl, {
                method,
                headers,
                body,
                cache: 'no-store',
              });

              if (upstream.status === 404) {
                upstream = await fetch(fallbackUrl, {
                  method,
                  headers,
                  body,
                  cache: 'no-store',
                });
              }

              const buf = Buffer.from(await upstream.arrayBuffer());

              res.statusCode = upstream.status;
              upstream.headers.forEach((value, key) => {
                if (key.toLowerCase() === 'transfer-encoding') return;
                if (key.toLowerCase() === 'content-encoding') return;
                if (key.toLowerCase() === 'content-length') return;
                res.setHeader(key, value);
              });

              res.end(buf);
            } catch (err) {
              console.error('[backend-dev-proxy] fetch failed', {
                message: err?.message,
                code: err?.code,
              });
              res.statusCode = 502;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ error: 'Backend request failed', message: err?.message, code: err?.code }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        // This forces a single instance of React, fixing the 'Invalid hook call' error.
        react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      },
    },
  };
});
