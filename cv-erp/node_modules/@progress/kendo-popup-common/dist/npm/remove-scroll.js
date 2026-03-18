"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeScroll = void 0;
var removeScroll = function (rect, scroll) {
    return {
        top: rect.top - scroll.y,
        left: rect.left - scroll.x,
        height: rect.height,
        width: rect.width
    };
};
exports.removeScroll = removeScroll;
