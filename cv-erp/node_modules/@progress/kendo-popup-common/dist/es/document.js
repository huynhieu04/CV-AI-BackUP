import ownerDocument from './owner-document';
export var getDocumentElement = function (element) { return ownerDocument(element).documentElement; };
