"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScroll = void 0;
var addScroll = function (rect, scroll) {
    return {
        top: rect.top + scroll.y,
        left: rect.left + scroll.x,
        height: rect.height,
        width: rect.width
    };
};
exports.addScroll = addScroll;
