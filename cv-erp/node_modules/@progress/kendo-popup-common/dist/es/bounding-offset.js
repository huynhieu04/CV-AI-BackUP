import { windowViewport } from './window-viewport';
export var boundingOffset = function (element) {
    if (!element.getBoundingClientRect) {
        var viewport = windowViewport(element);
        return {
            bottom: viewport.height,
            left: 0,
            right: viewport.width,
            top: 0
        };
    }
    var _a = element.getBoundingClientRect(), bottom = _a.bottom, left = _a.left, right = _a.right, top = _a.top;
    return {
        bottom: bottom,
        left: left,
        right: right,
        top: top
    };
};
