import * as clangd_wasm from "./clangd_wasm";
import { basicSetup, EditorView } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import clangWasm from "@clangd-wasm/core/dist/clangd.wasm?url";
let clangCoreUrl = String(clangWasm).split("/");
clangCoreUrl.pop();
clangCoreUrl = clangCoreUrl.join("/");
globalThis.clangd = new clangd_wasm.ClangdStdioTransport({
  baseURL: clangCoreUrl,
  debug: true,
});
