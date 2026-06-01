import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import apiHandler from './api/[...path]';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'netlify-functions-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              try {
                const bodyStr = await new Promise<string>((resolve) => {
                  let data = '';
                  req.on('data', chunk => data += chunk);
                  req.on('end', () => resolve(data));
                });

                let parsedBody: any = undefined;
                try { parsedBody = bodyStr ? JSON.parse(bodyStr) : undefined; } catch { parsedBody = bodyStr; }

                // Fake VercelRequest
                const fakeReq: any = {
                  method: req.method,
                  url: req.url,
                  headers: req.headers,
                  body: parsedBody,
                  query: Object.fromEntries(new URL(req.url!, `http://${req.headers.host}`).searchParams),
                };

                // Fake VercelResponse
                let statusCode = 200;
                const fakeRes: any = {
                  statusCode,
                  status(code: number) { statusCode = code; return fakeRes; },
                  setHeader(k: string, v: string) { res.setHeader(k, v); return fakeRes; },
                  json(data: any) {
                    res.statusCode = statusCode;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end(data: any) { res.statusCode = statusCode; res.end(data); },
                };

                await apiHandler(fakeReq, fakeRes);
                return;
              } catch (error) {
                console.error('API emulator error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal server error' }));
                return;
              }
            }
            next();
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
