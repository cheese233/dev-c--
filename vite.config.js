import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import PackageJSON from "./package.json";
const DEFINES = {
    version: PackageJSON.version,
    name: "Dev-C--",
};
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
    ],
    build: {
        minify: false,
        manifest: false,
    },
    define: {
        __DEFINES__: DEFINES,
    },
});
