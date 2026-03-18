import { elementScrollPosition } from './element-scroll-position';
import { offsetParent } from './offset-parent';
export var parentScrollPosition = function (element) {
    var parent = offsetParent(element);
    return parent ? elementScrollPosition(parent) : { x: 0, y: 0 };
};
