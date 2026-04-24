import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <-- INI YANG TADI HILANG
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- DAN INI JUGA TADI HILANG
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Fintik Financial App",
        short_name: "Fintik",
        description: "Kelola keuangan dengan gaya modern",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
