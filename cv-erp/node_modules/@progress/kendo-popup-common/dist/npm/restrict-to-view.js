"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictToView = void 0;
var align_point_1 = require("./align-point");
var collision_1 = require("./collision");
var fit = function (position, size, viewPortSize) {
    var output = 0;
    if (position + size > viewPortSize) {
        output = viewPortSize - (position + size);
    }
    if (position < 0) {
        output = -position;
    }
    return output;
};
var flip = function (_a) {
    var offset = _a.offset, size = _a.size, anchorSize = _a.anchorSize, viewPortSize = _a.viewPortSize, anchorAlignPoint = _a.anchorAlignPoint, elementAlignPoint = _a.elementAlignPoint, margin = _a.margin;
    var output = 0;
    var isPositionCentered = elementAlignPoint === align_point_1.AlignPoint.center || elementAlignPoint === align_point_1.AlignPoint.middle;
    var isOriginCentered = anchorAlignPoint === align_point_1.AlignPoint.center || anchorAlignPoint === align_point_1.AlignPoint.middle;
    var marginToAdd = 2 * margin; // 2x to keep margin after flip
    if (elementAlignPoint !== anchorAlignPoint && !isPositionCentered && !isOriginCentered) {
        var isBeforeAnchor = anchorAlignPoint === align_point_1.AlignPoint.top || anchorAlignPoint === align_point_1.AlignPoint.left;
        if (offset < 0 && isBeforeAnchor) {
            output = size + anchorSize + marginToAdd;
            if (offset + output + size > viewPortSize) {
                output = 0; // skip flip
            }
        }
        else if (offset >= 0 && !isBeforeAnchor) {
            if (offset + size > viewPortSize) {
                output += -(anchorSize + size + marginToAdd);
            }
            if (offset + output < 0) {
                output = 0; // skip flip
            }
        }
    }
    return output;
};
var restrictToView = function (_a) {
    var anchorRect = _a.anchorRect, anchorAlign = _a.anchorAlign, elementRect = _a.elementRect, elementAlign = _a.elementAlign, collisions = _a.collisions, viewPort = _a.viewPort, _b = _a.margin, margin = _b === void 0 ? {} : _b;
    var elementTop = elementRect.top, elementLeft = elementRect.left, elementHeight = elementRect.height, elementWidth = elementRect.width;
    var viewPortHeight = viewPort.height, viewPortWidth = viewPort.width;
    var horizontalMargin = margin.horizontal || 0;
    var verticalMargin = margin.vertical || 0;
    var left = 0;
    var top = 0;
    var isVerticalFit = collisions.vertical === collision_1.Collision.fit;
    var isHorizontalFit = collisions.horizontal === collision_1.Collision.fit;
    var isVerticalFlip = collisions.vertical === collision_1.Collision.flip;
    var isHorizontalFlip = collisions.horizontal === collision_1.Collision.flip;
    if (isVerticalFit) {
        top += fit(elementTop, elementHeight, viewPortHeight);
    }
    if (isHorizontalFit) {
        left += fit(elementLeft, elementWidth, viewPortWidth);
    }
    if (isVerticalFlip) {
        top += flip({
            margin: verticalMargin,
            offset: elementTop,
            size: elementHeight,
            anchorSize: anchorRect.height,
            viewPortSize: viewPortHeight,
            anchorAlignPoint: anchorAlign.vertical,
            elementAlignPoint: elementAlign.vertical
        });
    }
    if (isHorizontalFlip) {
        left += flip({
            margin: horizontalMargin,
            offset: elementLeft,
            size: elementWidth,
            anchorSize: anchorRect.width,
            viewPortSize: viewPortWidth,
            anchorAlignPoint: anchorAlign.horizontal,
            elementAlignPoint: elementAlign.horizontal
        });
    }
    var flippedVertical = isVerticalFlip && top !== 0;
    var flippedHorizontal = isHorizontalFlip && left !== 0;
    var fittedVertical = isVerticalFit && top !== 0;
    var fittedHorizontal = isHorizontalFit && left !== 0;
    return {
        flipped: flippedHorizontal || flippedVertical,
        fitted: fittedVertical || fittedHorizontal,
        flip: {
            horizontal: flippedHorizontal,
            vertical: flippedVertical,
        },
        fit: {
            horizontal: fittedHorizontal,
            vertical: fittedVertical,
        },
        offset: {
            left: left,
            top: top,
        },
    };
};
exports.restrictToView = restrictToView;
