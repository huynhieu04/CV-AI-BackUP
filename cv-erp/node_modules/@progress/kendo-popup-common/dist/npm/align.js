"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.align = void 0;
var align_point_1 = require("./align-point");
var align = function (options) {
    var anchorRect = options.anchorRect, anchorAlign = options.anchorAlign, elementRect = options.elementRect, elementAlign = options.elementAlign, _a = options.margin, margin = _a === void 0 ? {} : _a;
    var anchorHorizontal = anchorAlign.horizontal;
    var anchorVertical = anchorAlign.vertical;
    var elementHorizontal = elementAlign.horizontal;
    var elementVertical = elementAlign.vertical;
    var horizontalMargin = margin.horizontal || 0;
    var verticalMargin = margin.vertical || 0;
    var top = anchorRect.top;
    var left = anchorRect.left;
    if (anchorVertical === align_point_1.AlignPoint.bottom) {
        top += anchorRect.height;
    }
    if (anchorVertical === align_point_1.AlignPoint.center || anchorVertical === align_point_1.AlignPoint.middle) {
        top += Math.round(anchorRect.height / 2);
    }
    if (elementVertical === align_point_1.AlignPoint.bottom) {
        top -= elementRect.height;
        verticalMargin *= -1;
    }
    if (elementVertical === align_point_1.AlignPoint.center || elementVertical === align_point_1.AlignPoint.middle) {
        top -= Math.round(elementRect.height / 2);
        verticalMargin *= -1;
    }
    if (anchorHorizontal === align_point_1.AlignPoint.right) {
        left += anchorRect.width;
    }
    if (anchorHorizontal === align_point_1.AlignPoint.center || anchorHorizontal === align_point_1.AlignPoint.middle) {
        left += Math.round(anchorRect.width / 2);
    }
    if (elementHorizontal === align_point_1.AlignPoint.right) {
        left -= elementRect.width;
        horizontalMargin *= -1;
    }
    if (elementHorizontal === align_point_1.AlignPoint.center || elementHorizontal === align_point_1.AlignPoint.middle) {
        left -= Math.round(elementRect.width / 2);
        horizontalMargin *= -1;
    }
    return {
        top: top + verticalMargin,
        left: left + horizontalMargin
    };
};
exports.align = align;
