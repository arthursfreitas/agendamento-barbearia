import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const tanstackExclude = [
  "@tanstack/react-start",
  "@tanstack/react-router",
  "@tanstack/start-server-core",
  "@tanstack/start-client-core",
  "@tanstack/start-static-server-functions",
];

export default defineConfig({
  plugins: [
    {
      name: "ensure-excludes",
      configEnvironment(_name, envConfig) {
        if (!envConfig.optimizeDeps) envConfig.optimizeDeps = {};
        const od = envConfig.optimizeDeps;
        if (!od.exclude) od.exclude = [];
        for (const dep of tanstackExclude) {
          if (!od.exclude.includes(dep)) od.exclude.push(dep);
        }
      },
    },
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    cloudflare(),
  ],
});