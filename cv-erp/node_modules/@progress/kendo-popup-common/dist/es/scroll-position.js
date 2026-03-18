import { getDocumentElement } from './document';
import { getWindow } from './window';
export var scrollPosition = function (element) {
    var documentElement = getDocumentElement(element);
    var win = getWindow(element);
    return {
        x: win.pageXOffset || documentElement.scrollLeft || 0,
        y: win.pageYOffset || documentElement.scrollTop || 0
    };
};
