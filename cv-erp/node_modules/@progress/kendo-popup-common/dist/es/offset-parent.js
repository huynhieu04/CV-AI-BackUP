export var offsetParent = function (element) {
    var offsetParent = element.offsetParent;
    while (offsetParent && offsetParent.style.position === 'static') {
        offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || element.ownerDocument.documentElement;
};
