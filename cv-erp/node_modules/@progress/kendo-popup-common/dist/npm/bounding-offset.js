"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundingOffset = void 0;
var window_viewport_1 = require("./window-viewport");
var boundingOffset = function (element) {
    if (!element.getBoundingClientRect) {
        var viewport = (0, window_viewport_1.windowViewport)(element);
        return {
            bottom: viewport.height,
            left: 0,
            right: viewport.width,
            top: 0
        };
    }
    var _a = element.getBoundingClientRect(), bottom = _a.bottom, left = _a.left, right = _a.right, top = _a.top;
    return {
        bottom: bottom,
        left: left,
        right: right,
        top: top
    };
};
exports.boundingOffset = boundingOffset;
