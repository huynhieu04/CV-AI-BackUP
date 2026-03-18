import { domUtils } from './dom-utils';
import { utils } from './utils';
export var positionElement = function (settings) {
    var anchor = settings.anchor, currentLocation = settings.currentLocation, element = settings.element, anchorAlign = settings.anchorAlign, elementAlign = settings.elementAlign, collisions = settings.collisions, margin = settings.margin, scale = settings.scale;
    var currentScale = scale || 1;
    var elementOffset = domUtils.offsetAtPoint(element, currentLocation);
    var elementRect = utils.scaleRect(elementOffset, currentScale);
    var anchorOffset = utils.scaleRect(domUtils.offset(anchor), currentScale);
    var anchorRect = utils.eitherRect(anchorOffset, currentLocation);
    var viewPort = settings.viewPort || domUtils.windowViewport(element);
    viewPort.width = viewPort.width / currentScale;
    viewPort.height = viewPort.height / currentScale;
    var result = domUtils.restrictToView({
        anchorAlign: anchorAlign,
        anchorRect: anchorRect,
        collisions: collisions,
        elementAlign: elementAlign,
        elementRect: elementRect,
        margin: margin,
        viewPort: viewPort
    });
    var offset = domUtils.addOffset(currentLocation, result.offset);
    return {
        flip: result.flip,
        flipped: result.flipped,
        fit: result.fit,
        fitted: result.fitted,
        offset: offset
    };
};
