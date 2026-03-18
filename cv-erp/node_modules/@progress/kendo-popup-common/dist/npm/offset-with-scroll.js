"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var document_1 = require("./document");
var offset_1 = require("./offset");
var window_1 = require("./window");
exports.default = (function (element) {
    var _a = (0, offset_1.offset)(element), top = _a.top, left = _a.left;
    var _b = (0, offset_1.offset)(element), height = _b.height, width = _b.width;
    if (width || height) {
        var documentElement = (0, document_1.getDocumentElement)(element);
        var win = (0, window_1.getWindow)(element);
        top += win['pageYOffset'] - documentElement.clientTop;
        left += win['pageXOffset'] - documentElement.clientLeft;
    }
    return {
        top: top,
        left: left,
        height: height,
        width: width
    };
});
