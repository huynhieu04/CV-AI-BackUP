import { domUtils } from './dom-utils';
import { utils } from './utils';
var absoluteRect = function (anchor, element, offset, scale) {
    var scrollPos = elementScrollPosition(anchor, element);
    var rect = utils.eitherRect(domUtils.offset(anchor), offset);
    var stackScale = 2 * scale;
    var stackScroll = domUtils.stackingElementScroll(element);
    if (scale !== 1 && stackScroll) {
        stackScroll.x /= stackScale;
        stackScroll.y /= stackScale;
    }
    var stackOffset = domUtils.stackingElementOffset(element);
    if (scale !== 1 && stackOffset) {
        stackOffset.left /= stackScale;
        stackOffset.top /= stackScale;
    }
    return domUtils.removeScroll(domUtils.addScroll(utils.removeStackingOffset(utils.scaleRect(rect, scale), stackOffset), stackScroll), scrollPos);
};
var relativeRect = function (anchor, element, offset, scale) {
    var rect = utils.eitherRect(domUtils.position(anchor, element, scale), offset);
    return utils.scaleRect(rect, scale);
};
var elementScrollPosition = function (anchor, element) {
    return anchor ? { x: 0, y: 0 } : domUtils.scrollPosition(element);
};
export var alignElement = function (settings) {
    var anchor = settings.anchor, element = settings.element, anchorAlign = settings.anchorAlign, elementAlign = settings.elementAlign, margin = settings.margin, offset = settings.offset, positionMode = settings.positionMode, scale = settings.scale;
    var currentScale = scale || 1;
    var fixedMode = positionMode === 'fixed' || !domUtils.hasOffsetParent(element);
    var anchorRect = fixedMode ? absoluteRect(anchor, element, offset, currentScale) : relativeRect(anchor, element, offset, currentScale);
    var elementRect = utils.scaleRect(domUtils.offset(element), currentScale);
    var result = domUtils.align({
        anchorAlign: anchorAlign,
        anchorRect: anchorRect,
        elementAlign: elementAlign,
        elementRect: elementRect,
        margin: margin
    });
    return result;
};
