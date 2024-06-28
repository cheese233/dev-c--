import createClangModule from "@cheese233/clang-wasm/dist/clang";
import decodeASAR from "./asar";
// Adapted from https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/src/browser/getCreateFFmpegCore.js
/** @param {string} url
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
const toBlobURL = async (url, mimeType) => {
    const buf = await (await fetch(url)).arrayBuffer();
    const blob = new Blob([buf], { type: mimeType });
    const blobURL = URL.createObjectURL(blob);
    return blobURL;
};
class ClangModule {
    FS = undefined;

    mainScriptUrlOrBlob: string;
    /** @default [] */
    arguments = [];

    /** @default [] */
    outputMessageBuf = [];
    /** @default null */
    outputMessageLength = null;
    /** @default [] */
    stderrBuf = [];

    mainJSObjectURL: string;

    workerJSObjectURL: string;

    options = {};

    onMessageHook = undefined;

    baseURL = undefined;

    wasmObjectURL: string;
    constructor(options, onMessageHook) {
        this.options = options;
        this.onMessageHook = onMessageHook;
    }
    /**
     * @param {ClangdModule} module
     * @returns {void}
     */
    preRun(module) {
        const stdin = function () {
            return null;
        };
        const stdout = function (inByte) {
            // We handle things byte by byte instead of character by character
            // to make sure we're unicode friendly
            module.outputMessageBuf.push(inByte);

            let outputMessageString;
            try {
                outputMessageString = new TextDecoder().decode(
                    new Uint8Array(module.outputMessageBuf)
                );
            } catch {
                // We're in the middle of receiving a multi-byte character.
                return;
            }

            if (module.outputMessageLength == null) {
                // Receiving headers
                if (outputMessageString.endsWith("\r\n\r\n")) {
                    module.outputMessageLength = parseInt(
                        outputMessageString.split(":")[1].trim()
                    );
                    module.outputMessageBuf = [];
                }
            } else {
                if (
                    module.outputMessageBuf.length == module.outputMessageLength
                ) {
                    // message time!
                    module.onMessageHook(outputMessageString);
                    module.outputMessageBuf = [];
                    module.outputMessageLength = null;
                }
            }
        };

        const stderr = function (outByte) {
            if (!module.options.debug) return;

            module.stderrBuf.push(outByte);

            let stderrString;
            try {
                stderrString = new TextDecoder().decode(
                    new Uint8Array(module.stderrBuf)
                );
            } catch {
                // We're in the middle of receiving a multi-byte character.
                return;
            }

            if (stderrString.endsWith("\n")) {
                // \n
                console.warn(stderrString);
                module.stderrBuf = [];
            }
        };

        module.FS.init(stdin, stdout, stderr);
        for (const filename in module.options.initialFileState) {
            try {
                if (filename != "/") {
                    if (
                        module.options.initialFileState[filename].isDir == true
                    ) {
                        module.FS.mkdir(filename);
                    } else {
                        module.FS.writeFile(
                            filename,
                            module.options.initialFileState[filename].content
                        );
                    }
                }
            } catch (err) {
                console.error(err, "at", filename);
            }
        }

        module.arguments.push(
            "-isysroot/",
            "-cxx-isystem/include/c++/v1",
            "-isystem-after/include",
            "-isystem-after/lib/clang/8.0.1/include",
            "-resource-dir=/lib/clang/8.0.1",
            "--target=wasm32-wasi",
            ...module.options.compileCommands
        );
    }

    /** @param {string} path
     * @param {string} _prefix
     * @returns {string}
     */
    locateFile(path, _prefix) {
        if (path.endsWith(".js")) {
            console.log(path, this.mainJSObjectURL);
            return this.mainJSObjectURL;
        }
        if (path.endsWith(".wasm")) {
            return this.wasmObjectURL;
        }

        return (this.options as any).baseURL + "/" + path;
    }

    /** @returns {Promise<void>} */
    async start() {
        this.mainJSObjectURL = await toBlobURL(
            (
                await import("@cheese233/clang-wasm/dist/clangd.js?url")
            ).default,
            "application/javascript"
        );
        this.wasmObjectURL = await toBlobURL(
            (
                await import("@cheese233/clang-wasm/dist/clangd.wasm?url")
            ).default,
            "application/wasm"
        );

        this.mainScriptUrlOrBlob = this.mainJSObjectURL;
        createClangModule(this);
    }
    /** @default [] */
    messageBuf = [];
}

export async function compile(files: Files, fileName: string) {
    await new ClangModule(
        {
            initialFileState: Object.assign(
                await decodeASAR(
                    new Uint8Array(
                        await (
                            await fetch(
                                (
                                    await import("./sysroot.asar?url")
                                ).default
                            )
                        ).arrayBuffer()
                    )
                ),
                files
            ),
            compileCommands: ["-o main.out", fileName],
        },
        (msg) => console.log(msg)
    ).start();
}
interface Files {
    [name: string]: FileOrFolder;
}
interface FileOrFolder {
    content?: Uint8Array;
    isDir?: boolean;
}
