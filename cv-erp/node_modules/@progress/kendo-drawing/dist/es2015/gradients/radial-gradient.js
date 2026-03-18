import withPoints from '../mixins/with-points';
import Point from '../geometry/point';
import Gradient from './gradient';

class RadialGradient extends withPoints(Gradient, [ "center" ]) {
    constructor(options = {}) {
        super(options);
        this.center(options.center || new Point());
        this._radius = options.radius !== undefined ? options.radius : 1;
        this._fallbackFill = options.fallbackFill;
    }

    radius(value) {
        if (value !== undefined) {
            this._radius = value;
            this.geometryChange();
            return this;
        }
        return this._radius;
    }

    fallbackFill(value) {
        if (value !== undefined) {
            this._fallbackFill = value;
            this.optionsChange();
            return this;
        }
        return this._fallbackFill;
    }
}

export default RadialGradient;
