import { basicSetup, EditorView } from "codemirror";
import { cpp as codemirror_cpp } from "@codemirror/lang-cpp";
import { devcppTheme } from "./theme/dev-cpp";
import { languageServerWithTransport } from "codemirror-languageserver";
import { indentOnInput } from "@codemirror/language";
import lsp_wasm from "./lsp_wasm";
(async function () {
    const editor = new EditorView({
        doc: "\n",
        extensions: [
            basicSetup,
            codemirror_cpp(),
            devcppTheme,
            indentOnInput(),
            languageServerWithTransport({
                transport: await lsp_wasm(),
                rootUri: "file:///",
                workspaceFolders: null,
                documentUri: `file:///main.cpp`,
                languageId: "cpp",
                autoClose: false,
            }),
        ],
        parent: document.getElementById("editor"),
    });
})();
