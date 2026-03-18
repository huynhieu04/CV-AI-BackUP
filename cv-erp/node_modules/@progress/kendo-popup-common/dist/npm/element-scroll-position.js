"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementScrollPosition = void 0;
var scroll_position_1 = require("./scroll-position");
var elementScrollPosition = function (element) {
    if (element === (element.ownerDocument || {}).body) {
        return (0, scroll_position_1.scrollPosition)(element);
    }
    return {
        x: element.scrollLeft,
        y: element.scrollTop
    };
};
exports.elementScrollPosition = elementScrollPosition;
