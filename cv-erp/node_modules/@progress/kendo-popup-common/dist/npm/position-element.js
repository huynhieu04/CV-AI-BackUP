"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionElement = void 0;
var dom_utils_1 = require("./dom-utils");
var utils_1 = require("./utils");
var positionElement = function (settings) {
    var anchor = settings.anchor, currentLocation = settings.currentLocation, element = settings.element, anchorAlign = settings.anchorAlign, elementAlign = settings.elementAlign, collisions = settings.collisions, margin = settings.margin, scale = settings.scale;
    var currentScale = scale || 1;
    var elementOffset = dom_utils_1.domUtils.offsetAtPoint(element, currentLocation);
    var elementRect = utils_1.utils.scaleRect(elementOffset, currentScale);
    var anchorOffset = utils_1.utils.scaleRect(dom_utils_1.domUtils.offset(anchor), currentScale);
    var anchorRect = utils_1.utils.eitherRect(anchorOffset, currentLocation);
    var viewPort = settings.viewPort || dom_utils_1.domUtils.windowViewport(element);
    viewPort.width = viewPort.width / currentScale;
    viewPort.height = viewPort.height / currentScale;
    var result = dom_utils_1.domUtils.restrictToView({
        anchorAlign: anchorAlign,
        anchorRect: anchorRect,
        collisions: collisions,
        elementAlign: elementAlign,
        elementRect: elementRect,
        margin: margin,
        viewPort: viewPort
    });
    var offset = dom_utils_1.domUtils.addOffset(currentLocation, result.offset);
    return {
        flip: result.flip,
        flipped: result.flipped,
        fit: result.fit,
        fitted: result.fitted,
        offset: offset
    };
};
exports.positionElement = positionElement;
