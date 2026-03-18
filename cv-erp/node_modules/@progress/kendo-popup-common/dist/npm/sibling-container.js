"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siblingContainer = void 0;
var parents_1 = require("./parents");
var siblings_1 = require("./siblings");
var siblingContainer = function (anchor, container) {
    var parentElements = (0, parents_1.parents)(anchor);
    var containerElement = container;
    var siblingElements;
    var result;
    while (containerElement) {
        siblingElements = (0, siblings_1.siblings)(containerElement);
        result = parentElements.reduce(function (list, p) { return list.concat(siblingElements.filter(function (s) { return s === p; })); }, [])[0];
        if (result) {
            break;
        }
        containerElement = containerElement.parentElement;
    }
    return result;
};
exports.siblingContainer = siblingContainer;
