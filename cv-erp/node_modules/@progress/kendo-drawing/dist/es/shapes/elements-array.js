import HasObservers from '../core/has-observers';

const splice = [].splice;
const slice = [].slice;

class ElementsArray extends HasObservers {
    constructor(array = []) {
        super();

        this.length = 0;
        this._splice(0, array.length, array);
    }

    elements(value) {
        if (value) {
            this._splice(0, this.length, value);

            this._change();
            return this;
        }

        return this.slice(0);
    }

    push(...elements) {
        let len = this.length;
        const count = elements.length;
        for (let i = 0; i < count; i++) {
            this[len + i] = elements[i];
            elements[i].addObserver(this);
        }
        this.length = len + count;
        this._change();
        return this.length;
    }

    slice() {
        return slice.call(this);
    }

    pop() {
        if (this.length > 0) {
            const result = this[this.length - 1];
            this.length--;
            result.removeObserver(this);
            this._change();
            return result;
        }
    }

    splice(index, howMany, ...elements) {
        const result = this._splice(index, howMany, elements);

        this._change();

        return result;
    }

    shift() {
        if (this.length > 0) {
            const result = this[0];
            for (let i = 1; i < this.length; i++) {
                this[i - 1] = this[i];
            }
            this.length--;
            result.removeObserver(this);
            this._change();
            return result;
        }
    }

    unshift(...elements) {
        const count = elements.length;
        for (let i = this.length - 1; i >= 0; i--) {
            this[i + count] = this[i];
        }
        for (let i = 0; i < count; i++) {
            this[i] = elements[i];
            elements[i].addObserver(this);
        }
        this.length += count;
        this._change();
        return this.length;
    }

    indexOf(element) {
        const length = this.length;

        for (let idx = 0; idx < length; idx++) {
            if (this[idx] === element) {
                return idx;
            }
        }
        return -1;
    }

    _splice(index, howMany, elements) {
        const result = splice.apply(this, [ index, howMany ].concat(elements));

        this._clearObserver(result);
        this._setObserver(elements);

        return result;
    }

    _add(elements) {
        this._setObserver(elements);
        this._change();
    }

    _remove(elements) {
        this._clearObserver(elements);
        this._change();
    }

    _setObserver(elements) {
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].addObserver(this);
        }
    }

    _clearObserver(elements) {
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].removeObserver(this);
        }
    }

    _change() {}
}

export default ElementsArray;
