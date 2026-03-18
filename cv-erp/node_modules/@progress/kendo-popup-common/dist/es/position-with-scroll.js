import { offsetParent } from './offset-parent';
import { offsetParentScrollPosition } from './offset-parent-scroll-position';
import { position } from './position';
export var positionWithScroll = function (element, parent, scale) {
    if (scale === void 0) { scale = 1; }
    var offsetParentElement = parent ? offsetParent(parent) : null;
    var _a = position(element, offsetParentElement), top = _a.top, left = _a.left, height = _a.height, width = _a.width;
    var _b = offsetParentScrollPosition(offsetParentElement, element), x = _b.x, y = _b.y;
    var ownerDocument = element.ownerDocument;
    var positionScale = offsetParentElement === ownerDocument.body || offsetParentElement === ownerDocument.documentElement ? 1 : scale;
    return {
        top: top + y * positionScale,
        left: left + x * positionScale,
        height: height,
        width: width
    };
};
