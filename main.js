import newEditor from "./editor.js";
import "@fontsource/unifont";
import "98.css";
newEditor(document.getElementById("editor"));
function handleTitle(title) {
    document.getElementById("title").innerHTML = title;
    document.title = title;
}
document.addEventListener("DOMContentLoaded", () =>
    handleTitle(__DEFINES__.name + " " + __DEFINES__.version)
);
