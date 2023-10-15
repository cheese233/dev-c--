"use strict";
let isDark = false;
import dev_cpp from "./dev-cpp.css?raw";
let cssText = dev_cpp;

let cssClass = "ace-dev-cpp";
import dom from "ace-code/src/lib/dom";
dom.importCssString(cssText, cssClass, false);
export { isDark, cssText, cssClass };
