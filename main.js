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
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine,
    keymap,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
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
(async function () {
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
                foldGutter(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                highlightSelectionMatches(),
            ],
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
        parent: document.getElementById("editor"),
    });
    editor;
})();
