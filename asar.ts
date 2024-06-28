import { Buffer } from "buffer/";
import path from "path-browserify";
(globalThis.Buffer as any) = Buffer;
import { createFromBuffer } from "chromium-pickle-js";
export default async function decodeASAR(Uint8ASAR: Uint8Array) {
    const asar = Buffer.from(Uint8ASAR);
    const headerLength = createFromBuffer(asar.subarray(0, 8))
            .createIterator()
            .readUInt32(),
        header = JSON.parse(
            createFromBuffer(asar.subarray(8, 8 + headerLength))
                .createIterator()
                .readString()
        );
    function dfs(files: any, filePath: string) {
        if (!("files" in files)) {
            let f = {};
            const offset = Number(files.offset) + 8 + headerLength;
            f[filePath] = {
                content: asar.subarray(offset, offset + files.size),
            };
            return f;
        }
        let filesOutput = {};
        filesOutput[filePath] = { isDir: true };
        for (let f in files.files) {
            filesOutput = Object.assign(
                filesOutput,
                dfs(files.files[f], path.join(filePath, f))
            );
        }
        return filesOutput;
    }
    return dfs(header, "/");
}
