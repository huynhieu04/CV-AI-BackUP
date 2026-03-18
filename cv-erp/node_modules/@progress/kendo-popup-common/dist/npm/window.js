"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWindow = void 0;
var owner_document_1 = require("./owner-document");
var getWindow = function (element) { return (0, owner_document_1.default)(element).defaultView; };
exports.getWindow = getWindow;
