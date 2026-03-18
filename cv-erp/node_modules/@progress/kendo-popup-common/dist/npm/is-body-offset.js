"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBodyOffset = void 0;
var offset_parent_1 = require("./offset-parent");
var isBodyOffset = function (element) { return ((0, offset_parent_1.offsetParent)(element) === element.ownerDocument.body); };
exports.isBodyOffset = isBodyOffset;
