import { ClangdStdioTransport } from "./clangd_wasm";
import untar from "js-untar";
import path from "path-browserify";
export default async (debug = true) => {
    const sysRoot = await untar(
        await (await fetch("./sysroot.tar")).arrayBuffer()
    );
    let sysrootFiles = {};
    for (const file of sysRoot) {
        try {
            const paths = path.parse(file.name);
            // console.log(paths.dir, paths.base);
            if (file.type != 5) {
                sysrootFiles[path.join(paths.dir, paths.base)] = {
                    content: new Uint8Array(file.buffer),
                };
            } else {
                let last = "";
                if (debug) console.log(paths);
                for (let cDir of [
                    ...(paths.dir != "" ? paths.dir.split("/") : []),
                    paths.base,
                ]) {
                    last = path.join(last, cDir);
                    sysrootFiles[last] = { isDir: true };
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    return new ClangdStdioTransport({
        debug: debug,
        initialFileState: sysrootFiles,
    });
};
