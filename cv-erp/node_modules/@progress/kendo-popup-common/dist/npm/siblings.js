"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siblings = void 0;
var siblings = function (element) {
    var _a;
    var result = [];
    var sibling = (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.firstElementChild;
    while (sibling) {
        if (sibling !== element) {
            result.push(sibling);
        }
        sibling = sibling.nextElementSibling;
    }
    return result;
};
exports.siblings = siblings;
