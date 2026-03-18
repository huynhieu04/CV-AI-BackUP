"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offsetParent = void 0;
var offsetParent = function (element) {
    var offsetParent = element.offsetParent;
    while (offsetParent && offsetParent.style.position === 'static') {
        offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || element.ownerDocument.documentElement;
};
exports.offsetParent = offsetParent;
