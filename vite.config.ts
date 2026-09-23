import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Where `/api/*` goes during development. Point it at the VPS to develop against live data:
  //   API_PROXY_TARGET=https://api.classmate.co.tz npm run dev
  const apiTarget = env.API_PROXY_TARGET || "http://localhost:5000";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      // Only used when VITE_API_URL is left relative — it keeps the browser same-origin,
      // so no CORS configuration is needed while developing.
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@data": path.resolve(__dirname, "./data"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
  };
});
