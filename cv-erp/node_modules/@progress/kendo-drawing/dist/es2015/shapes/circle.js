import GeometryCircle from '../geometry/circle';
import paintable from '../mixins/paintable';
import measurable from '../mixins/measurable';
import withGeometry from '../mixins/with-geometry';
import Element from './element';

const DEFAULT_STROKE = "#000";

class Circle extends paintable(measurable(withGeometry(Element))) {
    get nodeType() {
        return "Circle";
    }

    constructor(geometry = new GeometryCircle(), options = {}) {
        super(options);

        this.geometry(geometry);

        if (this.options.stroke === undefined) {
            this.stroke(DEFAULT_STROKE);
        }
    }

    rawBBox() {
        return this._geometry.bbox();
    }

    _bbox(matrix) {
        return this._geometry.bbox(matrix);
    }

    _containsPoint(point) {
        return this.geometry().containsPoint(point);
    }

    _isOnPath(point) {
        return this.geometry()._isOnPath(point, this.options.stroke.width / 2);
    }
}

export default Circle;
