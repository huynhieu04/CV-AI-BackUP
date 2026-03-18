"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.position = void 0;
var offset_parent_1 = require("./offset-parent");
var offset_1 = require("./offset");
var window_1 = require("./window");
var position = function (element, parent) {
    var win = (0, window_1.getWindow)(element);
    var elementStyles = win.getComputedStyle(element);
    var offset = (0, offset_1.offset)(element);
    var parentElement = parent || (0, offset_parent_1.offsetParent)(element);
    var ownerDocument = element.ownerDocument;
    var useRelative = parentElement !== ownerDocument.body && parentElement !== ownerDocument.documentElement;
    var parentOffset = { top: 0, left: 0, height: 0, width: 0 };
    if (elementStyles.position !== "fixed" && useRelative) {
        var parentStyles = win.getComputedStyle(parentElement);
        parentOffset = (0, offset_1.offset)(parentElement);
        parentOffset.top += parseFloat(parentStyles.borderTopWidth);
        parentOffset.left += parseFloat(parentStyles.borderLeftWidth);
    }
    return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left,
        height: offset.height,
        width: offset.width
    };
};
exports.position = position;
