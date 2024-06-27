import { ClangdStdioTransport } from "./clangd_wasm";
import path from "path-browserify";
import decodeASAR from "../asar";
export default async (debug = true) => {
    return new ClangdStdioTransport({
        debug: debug,
        initialFileState: await decodeASAR(
            new Uint8Array(
                await (
                    await fetch((await import("../sysroot.asar?url")).default)
                ).arrayBuffer()
            )
        ),
    });
};
