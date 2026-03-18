"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentScrollPosition = void 0;
var element_scroll_position_1 = require("./element-scroll-position");
var offset_parent_1 = require("./offset-parent");
var parentScrollPosition = function (element) {
    var parent = (0, offset_parent_1.offsetParent)(element);
    return parent ? (0, element_scroll_position_1.elementScrollPosition)(parent) : { x: 0, y: 0 };
};
exports.parentScrollPosition = parentScrollPosition;
