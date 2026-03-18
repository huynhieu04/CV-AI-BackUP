import { offsetParent } from './offset-parent';
import { offset as offsetRect } from './offset';
import { getWindow } from './window';
export var position = function (element, parent) {
    var win = getWindow(element);
    var elementStyles = win.getComputedStyle(element);
    var offset = offsetRect(element);
    var parentElement = parent || offsetParent(element);
    var ownerDocument = element.ownerDocument;
    var useRelative = parentElement !== ownerDocument.body && parentElement !== ownerDocument.documentElement;
    var parentOffset = { top: 0, left: 0, height: 0, width: 0 };
    if (elementStyles.position !== "fixed" && useRelative) {
        var parentStyles = win.getComputedStyle(parentElement);
        parentOffset = offsetRect(parentElement);
        parentOffset.top += parseFloat(parentStyles.borderTopWidth);
        parentOffset.left += parseFloat(parentStyles.borderLeftWidth);
    }
    return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left,
        height: offset.height,
        width: offset.width
    };
};
