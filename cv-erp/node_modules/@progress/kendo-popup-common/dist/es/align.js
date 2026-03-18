import { AlignPoint } from './align-point';
export var align = function (options) {
    var anchorRect = options.anchorRect, anchorAlign = options.anchorAlign, elementRect = options.elementRect, elementAlign = options.elementAlign, _a = options.margin, margin = _a === void 0 ? {} : _a;
    var anchorHorizontal = anchorAlign.horizontal;
    var anchorVertical = anchorAlign.vertical;
    var elementHorizontal = elementAlign.horizontal;
    var elementVertical = elementAlign.vertical;
    var horizontalMargin = margin.horizontal || 0;
    var verticalMargin = margin.vertical || 0;
    var top = anchorRect.top;
    var left = anchorRect.left;
    if (anchorVertical === AlignPoint.bottom) {
        top += anchorRect.height;
    }
    if (anchorVertical === AlignPoint.center || anchorVertical === AlignPoint.middle) {
        top += Math.round(anchorRect.height / 2);
    }
    if (elementVertical === AlignPoint.bottom) {
        top -= elementRect.height;
        verticalMargin *= -1;
    }
    if (elementVertical === AlignPoint.center || elementVertical === AlignPoint.middle) {
        top -= Math.round(elementRect.height / 2);
        verticalMargin *= -1;
    }
    if (anchorHorizontal === AlignPoint.right) {
        left += anchorRect.width;
    }
    if (anchorHorizontal === AlignPoint.center || anchorHorizontal === AlignPoint.middle) {
        left += Math.round(anchorRect.width / 2);
    }
    if (elementHorizontal === AlignPoint.right) {
        left -= elementRect.width;
        horizontalMargin *= -1;
    }
    if (elementHorizontal === AlignPoint.center || elementHorizontal === AlignPoint.middle) {
        left -= Math.round(elementRect.width / 2);
        horizontalMargin *= -1;
    }
    return {
        top: top + verticalMargin,
        left: left + horizontalMargin
    };
};
