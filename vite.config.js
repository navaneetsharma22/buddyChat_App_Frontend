import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },

  build: {
    chunkSizeWarningLimit: 1000, // optional safety net

    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          chakra: ["@chakra-ui/react"],
          socket: ["socket.io-client"],
          emoji: ["emoji-picker-react"],
        },
      },
    },
  },
});
