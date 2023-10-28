import clangWasm from "@clangd-wasm/core/dist/clangd.wasm?url";
import { basicSetup, EditorView } from "codemirror";
import { cpp as codemirror_cpp } from "@codemirror/lang-cpp";
import { devcppTheme } from "./theme/dev-cpp";
import { languageServerWithTransport } from "codemirror-languageserver";
import { ClangdStdioTransport } from "./clangd_wasm";
import { indentOnInput } from "@codemirror/language";
import untar from "js-untar";
import sysroot from "./wasm-clang/sysroot.tar?url";
import path from "path-browserify";
let clangCoreUrl = String(clangWasm).split("/");
clangCoreUrl.pop();
clangCoreUrl = clangCoreUrl.join("/");
(async function () {
    const sysRoot = await untar(await (await fetch(sysroot)).arrayBuffer());
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
                console.log(paths);
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
    console.log(sysrootFiles);
    const editor = new EditorView({
        doc: "\n",
        extensions: [
            basicSetup,
            codemirror_cpp(),
            devcppTheme,
            indentOnInput(),
            languageServerWithTransport({
                transport: new ClangdStdioTransport({
                    baseURL: clangCoreUrl,
                    debug: true,
                    initialFileState: sysrootFiles,
                }),
                rootUri: "file:///",
                workspaceFolders: null,
                documentUri: `file:///main.cpp`,
                languageId: "cpp",
            }),
        ],
        parent: document.getElementById("editor"),
    });
})();
