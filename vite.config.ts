import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: path.resolve(__dirname, "client"),

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
      },
    },

    define: {
      __APP_ENV__: env,
    },

    server: {
      port: Number(env.VITE_DEV_PORT) || 5050,
      host: true,
      proxy: {
        [env.VITE_API_URL || "/api"]: {
          target: env.VITE_API_TARGET || "http://localhost:8093",
          changeOrigin: true,
          secure: false,
        },
        // Proxy static resource requests (anexos) to backend during development
        ["/resources"]: {
          target: env.VITE_API_TARGET || "http://localhost:8093",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path, // keep original path
        },
      },
    },
  };
});