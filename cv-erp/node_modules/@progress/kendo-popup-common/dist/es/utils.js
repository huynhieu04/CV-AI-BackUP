var eitherRect = function (rect, offset) {
    if (!rect) {
        return { height: 0, left: offset.left, top: offset.top, width: 0 };
    }
    return rect;
};
var scaleRect = function (rect, scale) {
    if (!rect || scale === 1) {
        return rect;
    }
    return {
        height: rect.height / scale,
        left: rect.left / scale,
        top: rect.top / scale,
        width: rect.width / scale
    };
};
var removeStackingOffset = function (rect, stackingOffset) {
    if (!stackingOffset) {
        return rect;
    }
    return {
        height: rect.height,
        left: rect.left - stackingOffset.left,
        top: rect.top - stackingOffset.top,
        width: rect.width
    };
};
function memoize(fun) {
    var _this = this;
    var result;
    var called = false;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (called) {
            return result;
        }
        result = fun.apply(_this, args);
        called = true;
        return result;
    };
}
var hasRelativeStackingContext = memoize(function (elementSource) {
    if (!canUseDOM()) {
        return false;
    }
    var currentDocument = elementSource ? elementSource.ownerDocument : document;
    if (!currentDocument || !currentDocument.body) {
        return false;
    }
    var top = 10;
    var parent = currentDocument.createElement("div");
    parent.style.transform = "matrix(10, 0, 0, 10, 0, 0)";
    parent.innerHTML = "<div style=\"position: fixed; top: ".concat(top, "px;\">child</div>");
    currentDocument.body.appendChild(parent);
    var isDifferent = parent.children[0].getBoundingClientRect().top !== top;
    currentDocument.body.removeChild(parent);
    return isDifferent;
});
var canUseDOM = function () { return Boolean(typeof window !== 'undefined' &&
    window.document &&
    // eslint-disable-next-line
    window.document.createElement); };
export var utils = {
    eitherRect: eitherRect,
    scaleRect: scaleRect,
    removeStackingOffset: removeStackingOffset,
    hasRelativeStackingContext: hasRelativeStackingContext,
    canUseDOM: canUseDOM
};
