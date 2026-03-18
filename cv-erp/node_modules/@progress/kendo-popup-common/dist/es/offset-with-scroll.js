import { getDocumentElement } from './document';
import { offset } from './offset';
import { getWindow } from './window';
export default (function (element) {
    var _a = offset(element), top = _a.top, left = _a.left;
    var _b = offset(element), height = _b.height, width = _b.width;
    if (width || height) {
        var documentElement = getDocumentElement(element);
        var win = getWindow(element);
        top += win['pageYOffset'] - documentElement.clientTop;
        left += win['pageXOffset'] - documentElement.clientLeft;
    }
    return {
        top: top,
        left: left,
        height: height,
        width: width
    };
});
