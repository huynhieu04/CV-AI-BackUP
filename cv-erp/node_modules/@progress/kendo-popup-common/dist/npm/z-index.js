"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zIndex = void 0;
var parents_1 = require("./parents");
var sibling_container_1 = require("./sibling-container");
var zIndex = function (anchor, container) {
    if (!anchor || !container) {
        return null;
    }
    var sibling = (0, sibling_container_1.siblingContainer)(anchor, container);
    if (!sibling) {
        return null;
    }
    var result = [anchor].concat((0, parents_1.parents)(anchor, sibling)).reduce(function (index, p) {
        var zIndexStyle = p.style.zIndex || window.getComputedStyle(p).zIndex;
        var current = parseInt(zIndexStyle, 10);
        return current > index ? current : index;
    }, 0);
    return result ? (result + 1) : null;
};
exports.zIndex = zIndex;
