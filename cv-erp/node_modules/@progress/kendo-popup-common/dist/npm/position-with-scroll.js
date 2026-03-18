"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionWithScroll = void 0;
var offset_parent_1 = require("./offset-parent");
var offset_parent_scroll_position_1 = require("./offset-parent-scroll-position");
var position_1 = require("./position");
var positionWithScroll = function (element, parent, scale) {
    if (scale === void 0) { scale = 1; }
    var offsetParentElement = parent ? (0, offset_parent_1.offsetParent)(parent) : null;
    var _a = (0, position_1.position)(element, offsetParentElement), top = _a.top, left = _a.left, height = _a.height, width = _a.width;
    var _b = (0, offset_parent_scroll_position_1.offsetParentScrollPosition)(offsetParentElement, element), x = _b.x, y = _b.y;
    var ownerDocument = element.ownerDocument;
    var positionScale = offsetParentElement === ownerDocument.body || offsetParentElement === ownerDocument.documentElement ? 1 : scale;
    return {
        top: top + y * positionScale,
        left: left + x * positionScale,
        height: height,
        width: width
    };
};
exports.positionWithScroll = positionWithScroll;
