"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parents = void 0;
var parents = function (element, until) {
    var result = [];
    var next = element.parentNode;
    while (next) {
        result.push(next);
        if (next === until) {
            break;
        }
        next = next.parentNode;
    }
    return result;
};
exports.parents = parents;
