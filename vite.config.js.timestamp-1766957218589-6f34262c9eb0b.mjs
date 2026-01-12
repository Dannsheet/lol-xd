// vite.config.js
import { defineConfig, loadEnv } from "file:///Users/danny/Documents/task%20scamer/Doja/dojaweb/dojaweb/node_modules/vite/dist/node/index.js";
import react from "file:///Users/danny/Documents/task%20scamer/Doja/dojaweb/dojaweb/node_modules/@vitejs/plugin-react-swc/index.js";
import { fileURLToPath, URL } from "url";
import process from "node:process";
import { Buffer } from "node:buffer";
var __vite_injected_original_import_meta_url = "file:///Users/danny/Documents/task%20scamer/Doja/dojaweb/dojaweb/vite.config.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "PEXELS_"]);
  const pexelsApiKey = env.PEXELS_API_KEY || env.VITE_PEXELS_API_KEY || "";
  console.log("[pexels-dev-proxy] PEXELS_API_KEY loaded:", Boolean(pexelsApiKey));
  return {
    plugins: [
      react(),
      {
        name: "pexels-dev-proxy",
        configureServer(server) {
          server.middlewares.use("/api/pexels", async (req, res) => {
            try {
              if (!pexelsApiKey) {
                res.statusCode = 500;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ error: "Missing PEXELS_API_KEY in .env" }));
                return;
              }
              const targetUrl = `https://api.pexels.com${req.url || ""}`;
              const upstream = await fetch(targetUrl, {
                headers: {
                  Authorization: pexelsApiKey,
                  Accept: "application/json",
                  "Accept-Encoding": "identity",
                  "User-Agent": "dojaweb-vite-proxy"
                },
                cache: "no-store"
              });
              const buf = Buffer.from(await upstream.arrayBuffer());
              if (!upstream.ok) {
                const bodyText = new TextDecoder("utf-8").decode(buf).slice(0, 500);
                const headers = {};
                upstream.headers.forEach((value, key) => {
                  headers[key] = value;
                });
                console.error("[pexels-dev-proxy] upstream non-2xx", {
                  status: upstream.status,
                  url: targetUrl,
                  body: bodyText.slice(0, 500),
                  headers
                });
              }
              res.statusCode = upstream.status;
              upstream.headers.forEach((value, key) => {
                if (key.toLowerCase() === "transfer-encoding") return;
                if (key.toLowerCase() === "content-encoding") return;
                if (key.toLowerCase() === "content-length") return;
                res.setHeader(key, value);
              });
              res.end(buf);
            } catch (err) {
              console.error("[pexels-dev-proxy] fetch failed", {
                message: err?.message,
                code: err?.code
              });
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "Pexels request failed", message: err?.message, code: err?.code }));
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        // This forces a single instance of React, fixing the 'Invalid hook call' error.
        react: fileURLToPath(new URL("./node_modules/react", __vite_injected_original_import_meta_url))
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZGFubnkvRG9jdW1lbnRzL3Rhc2sgc2NhbWVyL0RvamEvZG9qYXdlYi9kb2phd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZGFubnkvRG9jdW1lbnRzL3Rhc2sgc2NhbWVyL0RvamEvZG9qYXdlYi9kb2phd2ViL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9kYW5ueS9Eb2N1bWVudHMvdGFzayUyMHNjYW1lci9Eb2phL2RvamF3ZWIvZG9qYXdlYi92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICd1cmwnO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ25vZGU6YnVmZmVyJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBbJ1ZJVEVfJywgJ1BFWEVMU18nXSk7XG4gIGNvbnN0IHBleGVsc0FwaUtleSA9IGVudi5QRVhFTFNfQVBJX0tFWSB8fCBlbnYuVklURV9QRVhFTFNfQVBJX0tFWSB8fCAnJztcblxuICBjb25zb2xlLmxvZygnW3BleGVscy1kZXYtcHJveHldIFBFWEVMU19BUElfS0VZIGxvYWRlZDonLCBCb29sZWFuKHBleGVsc0FwaUtleSkpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3BleGVscy1kZXYtcHJveHknLFxuICAgICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9wZXhlbHMnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghcGV4ZWxzQXBpS2V5KSB7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNaXNzaW5nIFBFWEVMU19BUElfS0VZIGluIC5lbnYnIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRVcmwgPSBgaHR0cHM6Ly9hcGkucGV4ZWxzLmNvbSR7cmVxLnVybCB8fCAnJ31gO1xuICAgICAgICAgICAgICBjb25zdCB1cHN0cmVhbSA9IGF3YWl0IGZldGNoKHRhcmdldFVybCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IHBleGVsc0FwaUtleSxcbiAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgJ0FjY2VwdC1FbmNvZGluZyc6ICdpZGVudGl0eScsXG4gICAgICAgICAgICAgICAgICAnVXNlci1BZ2VudCc6ICdkb2phd2ViLXZpdGUtcHJveHknLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FjaGU6ICduby1zdG9yZScsXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5mcm9tKGF3YWl0IHVwc3RyZWFtLmFycmF5QnVmZmVyKCkpO1xuXG4gICAgICAgICAgICAgIGlmICghdXBzdHJlYW0ub2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5VGV4dCA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKS5kZWNvZGUoYnVmKS5zbGljZSgwLCA1MDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSB7fTtcbiAgICAgICAgICAgICAgICB1cHN0cmVhbS5oZWFkZXJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgIGhlYWRlcnNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1twZXhlbHMtZGV2LXByb3h5XSB1cHN0cmVhbSBub24tMnh4Jywge1xuICAgICAgICAgICAgICAgICAgc3RhdHVzOiB1cHN0cmVhbS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICB1cmw6IHRhcmdldFVybCxcbiAgICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlUZXh0LnNsaWNlKDAsIDUwMCksXG4gICAgICAgICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSB1cHN0cmVhbS5zdGF0dXM7XG4gICAgICAgICAgICAgIHVwc3RyZWFtLmhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEF2b2lkIHNlbmRpbmcgYmFjayBwcm9ibGVtYXRpYyBob3AtYnktaG9wIGhlYWRlcnMuXG4gICAgICAgICAgICAgICAgaWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSAndHJhbnNmZXItZW5jb2RpbmcnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gTm9kZSdzIGZldGNoIG1heSB0cmFuc3BhcmVudGx5IGRlY29tcHJlc3MgYnV0IHByZXNlcnZlIGhlYWRlcnMuXG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgc2VuZGluZyBlbmNvZGluZy9sZW5ndGggaGVhZGVycyB0byB0aGUgYnJvd3NlciB0byBwcmV2ZW50IGRlY29kZSBmYWlsdXJlcy5cbiAgICAgICAgICAgICAgICBpZiAoa2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LWVuY29kaW5nJykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmIChrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtbGVuZ3RoJykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHJlcy5lbmQoYnVmKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbcGV4ZWxzLWRldi1wcm94eV0gZmV0Y2ggZmFpbGVkJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycj8ubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBlcnI/LmNvZGUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMjtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnUGV4ZWxzIHJlcXVlc3QgZmFpbGVkJywgbWVzc2FnZTogZXJyPy5tZXNzYWdlLCBjb2RlOiBlcnI/LmNvZGUgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIC8vIFRoaXMgZm9yY2VzIGEgc2luZ2xlIGluc3RhbmNlIG9mIFJlYWN0LCBmaXhpbmcgdGhlICdJbnZhbGlkIGhvb2sgY2FsbCcgZXJyb3IuXG4gICAgICAgIHJlYWN0OiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vbm9kZV9tb2R1bGVzL3JlYWN0JywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVYsU0FBUyxjQUFjLGVBQWU7QUFDL1gsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZSxXQUFXO0FBQ25DLE9BQU8sYUFBYTtBQUNwQixTQUFTLGNBQWM7QUFKK0wsSUFBTSwyQ0FBMkM7QUFPdlEsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxDQUFDLFNBQVMsU0FBUyxDQUFDO0FBQzdELFFBQU0sZUFBZSxJQUFJLGtCQUFrQixJQUFJLHVCQUF1QjtBQUV0RSxVQUFRLElBQUksNkNBQTZDLFFBQVEsWUFBWSxDQUFDO0FBRTlFLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixnQkFBZ0IsUUFBUTtBQUN0QixpQkFBTyxZQUFZLElBQUksZUFBZSxPQUFPLEtBQUssUUFBUTtBQUN4RCxnQkFBSTtBQUNGLGtCQUFJLENBQUMsY0FBYztBQUNqQixvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxvQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8saUNBQWlDLENBQUMsQ0FBQztBQUNuRTtBQUFBLGNBQ0Y7QUFFQSxvQkFBTSxZQUFZLHlCQUF5QixJQUFJLE9BQU8sRUFBRTtBQUN4RCxvQkFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXO0FBQUEsZ0JBQ3RDLFNBQVM7QUFBQSxrQkFDUCxlQUFlO0FBQUEsa0JBQ2YsUUFBUTtBQUFBLGtCQUNSLG1CQUFtQjtBQUFBLGtCQUNuQixjQUFjO0FBQUEsZ0JBQ2hCO0FBQUEsZ0JBQ0EsT0FBTztBQUFBLGNBQ1QsQ0FBQztBQUVELG9CQUFNLE1BQU0sT0FBTyxLQUFLLE1BQU0sU0FBUyxZQUFZLENBQUM7QUFFcEQsa0JBQUksQ0FBQyxTQUFTLElBQUk7QUFDaEIsc0JBQU0sV0FBVyxJQUFJLFlBQVksT0FBTyxFQUFFLE9BQU8sR0FBRyxFQUFFLE1BQU0sR0FBRyxHQUFHO0FBQ2xFLHNCQUFNLFVBQVUsQ0FBQztBQUNqQix5QkFBUyxRQUFRLFFBQVEsQ0FBQyxPQUFPLFFBQVE7QUFDdkMsMEJBQVEsR0FBRyxJQUFJO0FBQUEsZ0JBQ2pCLENBQUM7QUFDRCx3QkFBUSxNQUFNLHVDQUF1QztBQUFBLGtCQUNuRCxRQUFRLFNBQVM7QUFBQSxrQkFDakIsS0FBSztBQUFBLGtCQUNMLE1BQU0sU0FBUyxNQUFNLEdBQUcsR0FBRztBQUFBLGtCQUMzQjtBQUFBLGdCQUNGLENBQUM7QUFBQSxjQUNIO0FBRUEsa0JBQUksYUFBYSxTQUFTO0FBQzFCLHVCQUFTLFFBQVEsUUFBUSxDQUFDLE9BQU8sUUFBUTtBQUV2QyxvQkFBSSxJQUFJLFlBQVksTUFBTSxvQkFBcUI7QUFHL0Msb0JBQUksSUFBSSxZQUFZLE1BQU0sbUJBQW9CO0FBQzlDLG9CQUFJLElBQUksWUFBWSxNQUFNLGlCQUFrQjtBQUM1QyxvQkFBSSxVQUFVLEtBQUssS0FBSztBQUFBLGNBQzFCLENBQUM7QUFFRCxrQkFBSSxJQUFJLEdBQUc7QUFBQSxZQUNiLFNBQVMsS0FBSztBQUNaLHNCQUFRLE1BQU0sbUNBQW1DO0FBQUEsZ0JBQy9DLFNBQVMsS0FBSztBQUFBLGdCQUNkLE1BQU0sS0FBSztBQUFBLGNBQ2IsQ0FBQztBQUNELGtCQUFJLGFBQWE7QUFDakIsa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELGtCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyx5QkFBeUIsU0FBUyxLQUFLLFNBQVMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQUEsWUFDcEc7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQTtBQUFBLFFBRUwsT0FBTyxjQUFjLElBQUksSUFBSSx3QkFBd0Isd0NBQWUsQ0FBQztBQUFBLE1BQ3ZFO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
