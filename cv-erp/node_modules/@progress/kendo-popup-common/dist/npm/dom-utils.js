"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domUtils = void 0;
var utils_1 = require("./utils");
var offset_1 = require("./offset");
var add_scroll_1 = require("./add-scroll");
var align_1 = require("./align");
var bounding_offset_1 = require("./bounding-offset");
var scroll_position_1 = require("./scroll-position");
var remove_scroll_1 = require("./remove-scroll");
var restrict_to_view_1 = require("./restrict-to-view");
var window_viewport_1 = require("./window-viewport");
var parents_1 = require("./parents");
var sibling_container_1 = require("./sibling-container");
var position_with_scroll_1 = require("./position-with-scroll");
var STYLES = [
    'font-size',
    'font-family',
    'font-stretch',
    'font-style',
    'font-weight',
    'line-height'
];
var addOffset = function (current, addition) {
    return {
        left: current.left + addition.left,
        top: current.top + addition.top
    };
};
var getWindow = function () {
    return utils_1.utils.canUseDOM() ? window : null;
};
var getFontStyles = function (el) {
    var window = getWindow();
    if (!window || !el) {
        return [];
    }
    var computedStyles = window.getComputedStyle(el);
    return STYLES.map(function (font) { return ({ key: font, value: computedStyles[font] }); });
};
var hasOffsetParent = function (el) {
    if (!el) {
        return false;
    }
    return Boolean(el.offsetParent);
};
var offset = function (el) {
    if (!el) {
        return null;
    }
    return (0, offset_1.offset)(el);
};
var offsetAtPoint = function (element, currentLocation) {
    if (!element) {
        return null;
    }
    var _a = element.style, left = _a.left, top = _a.top, transition = _a.transition;
    element.style.transition = 'none';
    element.style.left = "".concat(currentLocation.left, "px");
    element.style.top = "".concat(currentLocation.top, "px");
    var currentOffset = (0, offset_1.offset)(element);
    element.style.left = left;
    element.style.top = top;
    // prevents elements with transition to be animated because of the change
    // eslint-disable-next-line
    element.offsetHeight;
    element.style.transition = transition;
    return currentOffset;
};
var position = function (element, popupElement, scale) {
    if (!element || !popupElement) {
        return null;
    }
    var currentScale = scale || 1;
    return (0, position_with_scroll_1.positionWithScroll)(element, popupElement, currentScale);
};
var OVERFLOW_REGEXP = /auto|scroll/;
var overflowElementStyle = function (element) {
    return "".concat(window.getComputedStyle(element).overflow);
};
var overflowComputedStyle = function (element) {
    var styles = window.getComputedStyle(element);
    return "".concat(styles.overflow).concat(styles.overflowX).concat(styles.overflowY);
};
var overflowStyle = function (element) {
    return overflowElementStyle(element) || overflowComputedStyle(element);
};
var scrollableParents = function (element) {
    var parentElements = [];
    if (!utils_1.utils.canUseDOM()) {
        return parentElements;
    }
    var parent = element.parentElement;
    while (parent) {
        if (OVERFLOW_REGEXP.test(overflowStyle(parent)) || parent.hasAttribute('data-scrollable')) {
            parentElements.push(parent);
        }
        parent = parent.parentElement;
    }
    parentElements.push(window);
    return parentElements;
};
var getRelativeContextElement = function (el) {
    if (!el || !utils_1.utils.hasRelativeStackingContext()) {
        return null;
    }
    var parent = el.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).transform !== 'none') {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
};
var stackingElementOffset = function (el) {
    var relativeContextElement = getRelativeContextElement(el);
    if (!relativeContextElement) {
        return null;
    }
    return (0, offset_1.offset)(relativeContextElement);
};
var stackingElementScroll = function (el) {
    var relativeContextElement = getRelativeContextElement(el);
    if (!relativeContextElement) {
        return { x: 0, y: 0 };
    }
    return {
        x: relativeContextElement.scrollLeft,
        y: relativeContextElement.scrollTop
    };
};
var stackingElementViewPort = function (el) {
    var relativeContextElement = getRelativeContextElement(el);
    if (!relativeContextElement) {
        return null;
    }
    return {
        height: relativeContextElement.scrollHeight,
        width: relativeContextElement.scrollWidth
    };
};
var useRelativePosition = function (el) {
    return Boolean(getRelativeContextElement(el));
};
var zoomLevel = function () {
    if (!utils_1.utils.canUseDOM()) {
        return 1;
    }
    return parseFloat((document.documentElement.clientWidth / window.innerWidth).toFixed(2)) || 1;
};
var isZoomed = function () {
    return zoomLevel() > 1;
};
var zIndex = function (anchor, container) {
    if (!anchor || !utils_1.utils.canUseDOM()) {
        return null;
    }
    var sibling = (0, sibling_container_1.siblingContainer)(anchor, container);
    if (!sibling) {
        return null;
    }
    var result = [anchor].concat((0, parents_1.parents)(anchor, sibling)).reduce(function (index, p) {
        var zIndexStyle = p.style.zIndex || window.getComputedStyle(p).zIndex;
        var current = parseInt(zIndexStyle, 10);
        return current > index ? current : index;
    }, 0);
    return result ? result + 1 : null;
};
exports.domUtils = {
    addOffset: addOffset,
    addScroll: add_scroll_1.addScroll,
    align: align_1.align,
    boundingOffset: bounding_offset_1.boundingOffset,
    getFontStyles: getFontStyles,
    getWindow: getWindow,
    hasOffsetParent: hasOffsetParent,
    offset: offset,
    offsetAtPoint: offsetAtPoint,
    position: position,
    removeScroll: remove_scroll_1.removeScroll,
    restrictToView: restrict_to_view_1.restrictToView,
    scrollPosition: scroll_position_1.scrollPosition,
    scrollableParents: scrollableParents,
    getRelativeContextElement: getRelativeContextElement,
    stackingElementOffset: stackingElementOffset,
    stackingElementScroll: stackingElementScroll,
    stackingElementViewPort: stackingElementViewPort,
    useRelativePosition: useRelativePosition,
    windowViewport: window_viewport_1.windowViewport,
    zoomLevel: zoomLevel,
    isZoomed: isZoomed,
    zIndex: zIndex
};
