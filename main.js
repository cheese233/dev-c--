import { minimalSetup, EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { acceptCompletion, completionKeymap } from "@codemirror/autocomplete";
import { cpp as codemirror_cpp } from "@codemirror/lang-cpp";
import { devcppTheme } from "./theme/dev-cpp";
import { languageServerWithTransport } from "codemirror-languageserver";
import { indentOnInput } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import lsp_wasm from "./lsp_wasm";
(async function () {
    const editor = new EditorView({
        doc: "\n",
        extensions: [
            minimalSetup,
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
            keymap.of([
                ...completionKeymap,
                { key: "Tab", run: acceptCompletion },
                indentWithTab,
            ]),
        ],
        parent: document.getElementById("editor"),
    });
    editor;
})();
