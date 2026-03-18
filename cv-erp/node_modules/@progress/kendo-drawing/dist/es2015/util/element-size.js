import elementStyles from './element-styles';

function getPixels(value) {
    if (isNaN(value)) {
        return value;
    }
    return value + "px";
}

export default function elementSize(element, size) {
    if (size) {
        const { width, height } = size;

        if (width !== undefined) {
            element.style.width = getPixels(width);
        }

        if (height !== undefined) {
            element.style.height = getPixels(height);
        }

    } else {
        const size = elementStyles(element, [ 'width', 'height' ]);

        return {
            width: parseInt(size.width, 10),
            height: parseInt(size.height, 10)
        };
    }
}