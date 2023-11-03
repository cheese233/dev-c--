import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import { viteStaticCopy } from "vite-plugin-static-copy";
import * as packageJson from "./package.json";
const __isUseCDN__ = true;
export default defineConfig({
    plugins: [
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    res.setHeader(
                        "Cross-Origin-Embedder-Policy",
                        "require-corp"
                    );
                    next();
                });
            },
        },
        legacy({
            targets: ["defaults", "not IE 11"],
        }),
        viteStaticCopy({
            targets: __isUseCDN__
                ? []
                : [
                      {
                          src: "node_modules/@clangd-wasm/core/dist/*",
                          dest: "./",
                      },
                  ],
        }),
    ],
    build: {
        minify: false,
        manifest: true,
    },
    define: {
        __isUseCDN__: __isUseCDN__,
        __packageJson__: packageJson,
    },
});
