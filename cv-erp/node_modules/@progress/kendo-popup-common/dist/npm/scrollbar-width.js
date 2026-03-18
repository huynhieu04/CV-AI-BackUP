"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollbarWidth = void 0;
var cachedWidth = 0;
var scrollbarWidth = function () {
    if (!cachedWidth && typeof document !== 'undefined') {
        var div = document.createElement("div");
        div.style.cssText = "overflow:scroll;overflow-x:hidden;zoom:1;clear:both;display:block";
        div.innerHTML = "&nbsp;";
        document.body.appendChild(div);
        cachedWidth = div.offsetWidth - div.scrollWidth;
        document.body.removeChild(div);
    }
    return cachedWidth;
};
exports.scrollbarWidth = scrollbarWidth;
