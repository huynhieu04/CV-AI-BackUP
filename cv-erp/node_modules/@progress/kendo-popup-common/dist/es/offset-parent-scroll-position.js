import { elementScrollPosition } from "./element-scroll-position";
import { parentScrollPosition } from "./parent-scroll-position";
export var offsetParentScrollPosition = function (offsetParentElement, element) { return (offsetParentElement ? elementScrollPosition(offsetParentElement) : parentScrollPosition(element)); };
