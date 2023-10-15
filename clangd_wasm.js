import { getNotifications } from "@open-rpc/client-js/build/Request";
import { Transport } from "@open-rpc/client-js/build/transports/Transport";

import * as createClangdModule from "@clangd-wasm/core/dist/clangd";
import clangdUrl from "@clangd-wasm/core/dist/clangd?url";
import clangdWorkerUrl from "@clangd-wasm/core/dist/clangd.worker?url";
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

class ClangdModule {
  FS = undefined;

  mainScriptUrlOrBlob = undefined;
  /** @default [] */
  arguments = [];

  /** @default [] */
  outputMessageBuf = [];
  /** @default null */
  outputMessageLength = null;
  /** @default [] */
  stderrBuf = [];

  mainJSObjectURL = undefined;

  workerJSObjectURL = undefined;

  options = undefined;

  onMessageHook = undefined;

  baseURL = undefined;

  constructor(options, onMessageHook) {
    this.options = options;
    this.onMessageHook = onMessageHook;
  }

  /** @param {ClangdModule} module
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
        if (module.outputMessageBuf.length == module.outputMessageLength) {
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
      module.FS.writeFile(filename, module.options.initialFileState[filename]);
    }

    // There's no way to load a compile_commands.json config by the command line.
    // We need to write it into the project folder for it to be loaded.
    module.FS.writeFile(
      "/compile_commands.json",
      JSON.stringify(module.options.compileCommands)
    );

    module.arguments.push(...module.options.cliArguments);
  }

  /** @param {string} path
   * @param {string} _prefix
   * @returns {string}
   */
  locateFile(path, _prefix) {
    if (path.endsWith(".worker.js")) {
      return this.workerJSObjectURL;
    } else if (path.endsWith(".js")) {
      return this.mainJSObjectURL;
    }

    return this.options.baseURL + "/" + path;
  }

  /** @returns {Promise<void>} */
  async start() {
    this.mainJSObjectURL = await toBlobURL(clangdUrl, "application/javascript");
    this.workerJSObjectURL = await toBlobURL(
      clangdWorkerUrl,
      "application/javascript"
    );

    this.mainScriptUrlOrBlob = this.mainJSObjectURL;
    let ClangdModule;
    if (createClangdModule.default) {
      ClangdModule = createClangdModule.default;
    } else {
      ClangdModule = createClangdModule;
    }
    ClangdModule(this);
  }

  /** @default [] */
  messageBuf = [];
}

// Transport structure from https://gitlab.com/aedge/codemirror-web-workers-lsp-demo
/** @extends Transport */
class ClangdStdioTransport extends Transport {
  module = undefined;

  options = undefined;

  // static getDefaultBaseURL(useSmallBinary: boolean)
  // {
  //     const packageID = useSmallBinary ? "@clangd-wasm/core-small" : "@clangd-wasm/core"
  //     return `https://unpkg.com/@clangd-wasm/core@${packageInfo.devDependencies[packageID].substring(1)}/dist`
  // }

  // static getDefaultWasmURL(useSmallBinary: boolean) {
  //     return `${ClangdStdioTransport.getDefaultBaseURL(useSmallBinary)}/clangd.wasm`
  // }

  constructor(options) {
    super();

    this.options = options;

    if (!this.options) {
      this.options = {
        cliArguments: [],
      };
    }

    // if (this.options.useSmallBinary === undefined) {
    //   this.options.useSmallBinary = false;
    // }

    // if (!this.options.baseURL) {
    //     this.options.baseURL = ClangdStdioTransport.getDefaultBaseURL(this.options.useSmallBinary)
    // }

    if (!this.options.debug) {
      this.options.debug = false;
    }

    if (!this.options.initialFileState) {
      this.options.initialFileState = {};
    }

    if (!this.options.compileCommands) {
      this.options.compileCommands = [];
    }

    if (!this.options.cliArguments) {
      this.options.cliArguments = [];
    }

    this.module = new ClangdModule(this.options, (data) => {
      if (this.options.debug) {
        console.log("LS to editor <-", JSON.parse(data));
      }

      this.transportRequestManager.resolveResponse(data);
    });
  }

  /** @public
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise(async (resolve) => {
      await this.module.start();
      resolve();
    });
  }

  /** @public
   * @param {JSONRPCRequestData} data
   * @returns {Promise<any>}
   */
  async sendData(data) {
    if (this.options.debug) {
      console.log("Editor to LS ->", data);
    }

    const prom = this.transportRequestManager.addRequest(data, null);
    const notifications = getNotifications(data);
    this.module.messageBuf.push(data.request);
    this.transportRequestManager.settlePendingRequest(notifications);
    return prom;
  }

  /** @public
   * @returns {void}
   */
  close() {}
}

export { ClangdStdioTransport };

/**
 * @typedef {{
 *   directory: string;
 *   file: string;
 *   arguments: string[];
 *   output?: string;
 * }} CompileCommandEntry
 */
/** @typedef {CompileCommandEntry[]} CompileCommands */
/**
 * @typedef {{
 *   baseURL?: string;
 *   debug?: boolean;
 *   initialFileState?: { [filename: string]: string };
 *   compileCommands?: CompileCommands;
 *   cliArguments: string[];
 * }} ClangdStdioTransportOptions
 */
