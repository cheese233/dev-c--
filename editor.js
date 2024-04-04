import { EditorView } from "codemirror";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { acceptCompletion } from "@codemirror/autocomplete";
import { cpp as codemirror_cpp } from "@codemirror/lang-cpp";
import { devcppTheme } from "./extensions/dev-cpp";
import { languageServerWithTransport } from "codemirror-languageserver";
import { indentWithTab } from "@codemirror/commands";
import {
    lineNumbers,
    highlightActiveLineGutter,
    highlightSpecialChars,
    dropCursor,
    highlightActiveLine,
    keymap,
} from "@codemirror/view";
import {
    foldGutter,
    indentOnInput,
    syntaxHighlighting,
    defaultHighlightStyle,
    bracketMatching,
    foldKeymap,
} from "@codemirror/language";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import {
    closeBrackets,
    autocompletion,
    closeBracketsKeymap,
    completionKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import lsp_wasm from "./lsp_wasm";
import { getTime, logMsg } from "./core";
export default async function (parent) {
    const lsp = await getTime(lsp_wasm, (msg) =>
        logMsg(`在${msg}毫秒内加载了模块`)
    );
    const editor = new EditorView({
        doc: `#include <bits/stdc++.h> 
using namespace std;
int main(){
	string aa = "111"; 
	int s,sum = 0,last[2] = {0};
	bool a = false;
	while(cin >> s) {
		if(s > last[0]){
			sum++;
		}//sbsbs
		last[0] = s;
	}
	cout << sum;
	return 0;
}`,
        extensions: [
            [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                history(),
                foldGutter({
                    markerDOM: (open) => {
                        let element = document.createElement("div");
                        element.innerHTML = `<svg width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            version="1.1">
                                            <g id="layer1">
                                                <rect
                                                style="fill:#ffffff;stroke:#000000;stroke-width:1"
                                                width="12"
                                                height="12"
                                                x="0"
                                                y="0" />
                                                ${
                                                    !open
                                                        ? `<path
                                                            style="fill:none;stroke:#000000;stroke-width:1px"
                                                            d="m 6,1.5 c 0,0 0,9 0,9" />`
                                                        : ""
                                                }
                                                <path
                                                style="fill:none;stroke:#000000;stroke-width:1px"
                                                d="m 1.5,6 c 0,0 9,0 9,0" />
                                            </g>
                                            </svg>`;
                        return element;
                    },
                }),
                dropCursor(),
                indentOnInput(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                highlightActiveLine(),
                highlightSelectionMatches(),
            ],
            codemirror_cpp(),
            devcppTheme,
            languageServerWithTransport({
                transport: lsp,
                rootUri: "file:///",
                workspaceFolders: null,
                documentUri: `file:///main.cpp`,
                languageId: "cpp",
                autoClose: false,
            }),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap,
                { key: "Tab", run: acceptCompletion },
                indentWithTab,
            ]),
        ],
        parent: parent,
    });
}
