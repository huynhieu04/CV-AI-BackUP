import { offsetParent } from "./offset-parent";
export var isBodyOffset = function (element) { return (offsetParent(element) === element.ownerDocument.body); };
