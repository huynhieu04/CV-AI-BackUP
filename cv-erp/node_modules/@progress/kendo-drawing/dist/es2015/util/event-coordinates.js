export default function eventCoordinates(e) {
    if (((e.x || {}).location) !== undefined) {
        return {
            x: e.x.location,
            y: e.y.location
        };
    }
    return {
        x: e.pageX || e.clientX || 0,
        y: e.pageY || e.clientY || 0
    };
}