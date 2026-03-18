export default (function (element) {
    return (element && element.ownerDocument) || document;
});
