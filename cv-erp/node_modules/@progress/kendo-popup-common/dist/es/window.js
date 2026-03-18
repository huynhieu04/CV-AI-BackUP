import ownerDocument from './owner-document';
export var getWindow = function (element) { return ownerDocument(element).defaultView; };
