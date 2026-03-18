"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignElement = void 0;
var dom_utils_1 = require("./dom-utils");
var utils_1 = require("./utils");
var absoluteRect = function (anchor, element, offset, scale) {
    var scrollPos = elementScrollPosition(anchor, element);
    var rect = utils_1.utils.eitherRect(dom_utils_1.domUtils.offset(anchor), offset);
    var stackScale = 2 * scale;
    var stackScroll = dom_utils_1.domUtils.stackingElementScroll(element);
    if (scale !== 1 && stackScroll) {
        stackScroll.x /= stackScale;
        stackScroll.y /= stackScale;
    }
    var stackOffset = dom_utils_1.domUtils.stackingElementOffset(element);
    if (scale !== 1 && stackOffset) {
        stackOffset.left /= stackScale;
        stackOffset.top /= stackScale;
    }
    return dom_utils_1.domUtils.removeScroll(dom_utils_1.domUtils.addScroll(utils_1.utils.removeStackingOffset(utils_1.utils.scaleRect(rect, scale), stackOffset), stackScroll), scrollPos);
};
var relativeRect = function (anchor, element, offset, scale) {
    var rect = utils_1.utils.eitherRect(dom_utils_1.domUtils.position(anchor, element, scale), offset);
    return utils_1.utils.scaleRect(rect, scale);
};
var elementScrollPosition = function (anchor, element) {
    return anchor ? { x: 0, y: 0 } : dom_utils_1.domUtils.scrollPosition(element);
};
var alignElement = function (settings) {
    var anchor = settings.anchor, element = settings.element, anchorAlign = settings.anchorAlign, elementAlign = settings.elementAlign, margin = settings.margin, offset = settings.offset, positionMode = settings.positionMode, scale = settings.scale;
    var currentScale = scale || 1;
    var fixedMode = positionMode === 'fixed' || !dom_utils_1.domUtils.hasOffsetParent(element);
    var anchorRect = fixedMode ? absoluteRect(anchor, element, offset, currentScale) : relativeRect(anchor, element, offset, currentScale);
    var elementRect = utils_1.utils.scaleRect(dom_utils_1.domUtils.offset(element), currentScale);
    var result = dom_utils_1.domUtils.align({
        anchorAlign: anchorAlign,
        anchorRect: anchorRect,
        elementAlign: elementAlign,
        elementRect: elementRect,
        margin: margin
    });
    return result;
};
exports.alignElement = alignElement;
