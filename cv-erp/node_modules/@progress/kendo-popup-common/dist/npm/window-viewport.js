"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowViewport = void 0;
var document_1 = require("./document");
var scrollbar_width_1 = require("./scrollbar-width");
var window_1 = require("./window");
var windowViewport = function (element) {
    var win = (0, window_1.getWindow)(element);
    var documentElement = (0, document_1.getDocumentElement)(element);
    var result = {
        height: win.innerHeight,
        width: win.innerWidth
    };
    if (documentElement.scrollHeight - documentElement.clientHeight > 0) {
        result.width -= (0, scrollbar_width_1.scrollbarWidth)();
    }
    return result;
};
exports.windowViewport = windowViewport;
