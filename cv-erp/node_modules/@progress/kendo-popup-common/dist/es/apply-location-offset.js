export var applyLocationOffset = function (rect, location, isOffsetBody) {
    var top = rect.top, left = rect.left;
    if (isOffsetBody) {
        left = 0;
        top = 0;
    }
    return {
        top: top + location.top,
        left: left + location.left,
        height: rect.height,
        width: rect.width
    };
};
