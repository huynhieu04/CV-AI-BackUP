"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentElement = void 0;
var owner_document_1 = require("./owner-document");
var getDocumentElement = function (element) { return (0, owner_document_1.default)(element).documentElement; };
exports.getDocumentElement = getDocumentElement;
