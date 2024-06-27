import createClangModule from "@cheese233/clang-wasm/dist/clang";
import mainJSObjectURL from "@cheese233/clang-wasm/dist/clang?url";
import wasmObjectURL from "@cheese233/clang-wasm/dist/clang.wasm?url";
createClangModule({
    locateFile(path, _prefix) {
        if (path.endsWith(".js")) {
            return mainJSObjectURL;
        }
        if (path.endsWith(".wasm")) {
            return wasmObjectURL;
        }
    },
});
