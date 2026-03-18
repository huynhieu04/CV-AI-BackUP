import OptionsStore from '../core/options-store';
import withOptions from '../mixins/with-options';
import HasObservers from '../core/has-observers';

const options = [ "offset", "color", "opacity" ];

class GradientStop extends withOptions(HasObservers, options) {
    constructor(offset, color, opacity) {
        super();

        this.options = new OptionsStore({
            offset: offset,
            color: color,
            opacity: opacity !== undefined ? opacity : 1
        });

        this.options.addObserver(this);
    }
    static create(arg) {
        if (arg !== undefined) {
            let stop;
            if (arg instanceof GradientStop) {
                stop = arg;
            } else if (arg.length > 1) {
                stop = new GradientStop(arg[0], arg[1], arg[2]);
            } else {
                stop = new GradientStop(arg.offset, arg.color, arg.opacity);
            }
            return stop;
        }
    }
}

export default GradientStop;
