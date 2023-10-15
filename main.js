import * as ace from "ace-code";
import { AceLanguageClient } from "ace-linters/build/ace-language-client";
import { Mode as CppMode } from "ace-code/src/mode/c_cpp";
import * as clangd_wasm from "./clangd_wasm";
import clangWasm from "@clangd-wasm/core/dist/clangd.wasm?url";
let clangCoreUrl = String(clangWasm).split("/");
clangCoreUrl.pop();
clangCoreUrl = clangCoreUrl.join("/");
globalThis.clangd = new clangd_wasm.ClangdStdioTransport({
  baseURL: clangCoreUrl,
  debug: true,
});
await clangd.connect();
ace.config.setModuleLoader("theme/dev-cpp", () => import("./theme/dev-cpp"));
var editor = ace.edit("editor", {
  mode: new CppMode(),
  cursorStyle: "slim",
});
editor.setTheme("theme/dev-cpp");
