"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offset = void 0;
var rectOfHiddenElement = function (element) {
    var _a = element.style, display = _a.display, left = _a.left, position = _a.position;
    element.style.display = '';
    element.style.left = '-10000px';
    element.style.position = 'absolute';
    var rect = element.getBoundingClientRect();
    element.style.display = display;
    element.style.left = left;
    element.style.position = position;
    return {
        top: rect.top,
        left: rect.left,
        height: rect.height,
        width: rect.width
    };
};
var offset = function (element) {
    var rect = element.getBoundingClientRect();
    var left = rect.left, top = rect.top;
    if (!rect.height && !rect.width) {
        rect = rectOfHiddenElement(element);
    }
    return {
        top: top,
        left: left,
        height: rect.height,
        width: rect.width
    };
};
exports.offset = offset;
