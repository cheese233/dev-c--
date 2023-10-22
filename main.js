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
    sysrootFiles["/include"] = "__dir__";
    for (const file of sysRoot) {
        try {
            const content = file.readAsString();
            const paths = path.parse(file.name);
            if (
                paths.dir.startsWith("include") ||
                paths.dir.startsWith("lib/clang/8.0.1/include")
            ) {
                paths.dir = paths.dir.replace(/^include(\/)?/g, "");
                paths.dir = paths.dir.replace(
                    /^lib\/clang\/8\.0\.1\/include(\/)?/g,
                    ""
                );
                console.log(paths.dir, paths.base);
                if (content != "") {
                    sysrootFiles[path.join("/include", paths.dir, paths.base)] =
                        content;
                } else {
                    sysrootFiles[path.join("/include", paths.dir, paths.base)] =
                        "__dir__";
                }
            }
        } catch {}
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
