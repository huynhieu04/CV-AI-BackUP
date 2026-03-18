"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollPosition = void 0;
var document_1 = require("./document");
var window_1 = require("./window");
var scrollPosition = function (element) {
    var documentElement = (0, document_1.getDocumentElement)(element);
    var win = (0, window_1.getWindow)(element);
    return {
        x: win.pageXOffset || documentElement.scrollLeft || 0,
        y: win.pageYOffset || documentElement.scrollTop || 0
    };
};
exports.scrollPosition = scrollPosition;
