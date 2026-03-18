import { getDocumentElement } from './document';
import { scrollbarWidth } from './scrollbar-width';
import { getWindow } from './window';
export var windowViewport = function (element) {
    var win = getWindow(element);
    var documentElement = getDocumentElement(element);
    var result = {
        height: win.innerHeight,
        width: win.innerWidth
    };
    if (documentElement.scrollHeight - documentElement.clientHeight > 0) {
        result.width -= scrollbarWidth();
    }
    return result;
};
