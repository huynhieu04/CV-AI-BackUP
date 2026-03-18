"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offsetParentScrollPosition = void 0;
var element_scroll_position_1 = require("./element-scroll-position");
var parent_scroll_position_1 = require("./parent-scroll-position");
var offsetParentScrollPosition = function (offsetParentElement, element) { return (offsetParentElement ? (0, element_scroll_position_1.elementScrollPosition)(offsetParentElement) : (0, parent_scroll_position_1.parentScrollPosition)(element)); };
exports.offsetParentScrollPosition = offsetParentScrollPosition;
