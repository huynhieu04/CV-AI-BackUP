// Each function takes x in [0, 1] and returns a value in [0, 1]

export function swing(x) {
    return 0.5 - Math.cos(x * Math.PI) / 2;
}

export function linear(x) {
    return x;
}

export function easeOutElastic(x) {
    if (x === 0 || x === 1) {
        return x;
    }

    const p = 0.5;
    const s = p / 4;

    return Math.pow(2, -10 * x) *
           Math.sin((x - s) * (1.1 * Math.PI) / p) +
           1;
}

export function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(x) {
    return x < 0.5
        ? 4 * x * x * x
        : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutQuad(x) {
    return 1 - Math.pow(1 - x, 2);
}

export function easeInOutQuad(x) {
    return x < 0.5
        ? 2 * x * x
        : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeOutCirc(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

export function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInOutExpo(x) {
    if (x === 0 || x === 1) {
        return x;
    }

    return x < 0.5
        ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

export function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function easeInOutBack(x) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

export function easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
}

export function easeInOutQuint(x) {
    return x < 0.5
        ? 16 * Math.pow(x, 5)
        : 1 - Math.pow(-2 * x + 2, 5) / 2;
}
