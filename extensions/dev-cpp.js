import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Colors from https://www.nordtheme.com/docs/colors-and-palettes
// Polar Night
const base00 = "#2e3440", // black
    base01 = "#3b4252", // dark grey
    base02 = "#434c5e",
    base03 = "#4c566a"; // grey

// Snow Storm
const base04 = "#d8dee9", // grey
    base05 = "#e5e9f0", // off white
    base06 = "#eceff4"; // white

// Frost
const base07 = "#8fbcbb", // moss green
    base08 = "#88c0d0", // ice blue
    base09 = "#81a1c1", // water blue
    base0A = "#5e81ac"; // deep blue

// Aurora
const base0b = "#bf616a", // red
    base0C = "#d08770", // orange
    base0D = "#ebcb8b", // yellow
    base0E = "#a3be8c", // green
    base0F = "#b48ead"; // purple

const invalid = "#d30102",
    darkBackground = base06,
    highlightBackground = darkBackground,
    background = "#ffffff",
    tooltipBackground = base05,
    selection = "#000080 !important",
    cursor = base01;

/// The editor theme styles for Basic Light.
export const devCppTheme = EditorView.theme(
    {
        "&": {
            color: "#000000",
            backgroundColor: "#ffffff",
        },
        "& .cm-scroller": {
            "font-family": "Consolas",
        },
        ".cm-content": {
            caretColor: "#000000",
        },

        ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
            { backgroundColor: selection, color: "#ffffff" },
        ".cm-panels": { backgroundColor: darkBackground, color: base03 },
        ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
        ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

        ".cm-searchMatch": {
            backgroundColor: "#72a1ff59",
            outline: `1px solid ${base03}`,
        },
        ".cm-searchMatch.cm-searchMatch-selected": {
            backgroundColor: base05,
        },

        ".cm-activeLine": { backgroundColor: "#ccffff" },
        ".cm-selectionMatch": { backgroundColor: base05 },

        "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
            {
                // outline: `1px solid ${base03}`,
            },

        "&.cm-focused .cm-matchingBracket": {
            backgroundColor: "#ff0000",
        },
        "&.cm-focused .cm-matchingBracket > *,&.cm-focused .cm-matchingBracket":
            {
                color: "white",
            },
        ".cm-gutters": {
            backgroundColor: base06,
            color: base00,
            border: "none",
        },

        ".cm-activeLineGutter": {
            backgroundColor: highlightBackground,
        },
        "& .cm-lineNumbers .cm-gutterElement": {
            "padding-right": "10px",
        },
        ".cm-foldPlaceholder": {
            backgroundColor: "transparent",
            border: "none",
            color: "#ddd",
        },

        ".cm-tooltip": {
            border: "none",
            backgroundColor: tooltipBackground,
        },
        ".cm-tooltip .cm-tooltip-arrow:before": {
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
        },
        ".cm-tooltip .cm-tooltip-arrow:after": {
            borderTopColor: tooltipBackground,
            borderBottomColor: tooltipBackground,
        },
        ".cm-tooltip-autocomplete": {
            "& > ul > li[aria-selected]": {
                backgroundColor: highlightBackground,
                color: base03,
            },
        },
        "& .cm-line": {
            color: "#ff0000",
            "line-height": "1.2",
        },
    },
    { dark: false }
);

/// The highlighting style for code in the Basic Light theme.
export const devCppHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: "black", "font-weight": "bold" },
    {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: "black",
    },
    { tag: [t.variableName], color: "black" },
    { tag: [t.function(t.variableName)], color: "black" },
    { tag: [t.labelName], color: "black" },
    {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: "black",
    },
    {
        tag: [t.definition(t.name), t.separator],
        color: "#ff0000",
        "font-weight": "bold",
    },
    { tag: [t.bracket], color: "#ff0000", "font-weight": "bold" },
    {
        tag: [t.annotation],
        color: invalid,
    },
    {
        tag: [t.changed, t.annotation, t.modifier, t.self, t.namespace],
        color: "black",
    },
    {
        tag: [t.number],
        color: "purple",
    },
    {
        tag: [t.typeName, t.className],
        color: "black",
        "font-weight": "bold",
    },
    {
        tag: [t.operator, t.operatorKeyword],
        color: "#ff0000",
        "font-weight": "bold",
    },
    {
        tag: [t.tagName],
        color: base0F,
    },
    {
        tag: [t.squareBracket],
        color: "#ff0000",
        "font-weight": "bold",
    },
    {
        tag: [t.angleBracket],
        color: "#ff0000",
        "font-weight": "bold",
    },
    {
        tag: [t.attributeName],
        color: base0D,
    },
    {
        tag: [t.regexp],
        color: "black",
        "font-weight": "bold",
    },
    {
        tag: [t.quote],
        color: base01,
    },
    { tag: [t.string], color: "blue" },
    {
        tag: t.link,
        color: "black",
        "font-weight": "bold",
        textDecoration: "underline",
        textUnderlinePosition: "under",
    },
    {
        tag: [t.url, t.escape],
        color: "blue",
    },
    {
        tag: [t.special(t.string)],
        color: "green",
    },
    { tag: [t.meta], color: "black" },
    { tag: [t.comment], color: "#0078d7", fontStyle: "italic" },
    { tag: t.strong, "font-weight": "bold", color: base0A },
    { tag: t.emphasis, fontStyle: "italic", color: base0A },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.heading, "font-weight": "bold", color: base0A },
    { tag: t.special(t.heading1), "font-weight": "bold", color: base0A },
    { tag: t.heading1, "font-weight": "bold", color: base0A },
    {
        tag: [t.heading2, t.heading3, t.heading4],
        "font-weight": "bold",
        color: base0A,
    },
    {
        tag: [t.heading5, t.heading6],
        color: base0A,
    },
    {
        tag: [t.atom, t.bool, t.special(t.variableName)],
        color: "black",
        "font-weight": "bold",
    },
    {
        tag: [t.processingInstruction, t.inserted],
        color: "green",
    },
    {
        tag: [t.contentSeparator],
        color: "#000",
    },
    { tag: t.invalid, color: base02, borderBottom: `1px dotted ${invalid}` },
]);

/// Extension to enable the Basic Light theme (both the editor theme and
/// the highlight style).
export const devcppTheme = [
    devCppTheme,
    syntaxHighlighting(devCppHighlightStyle),
];
