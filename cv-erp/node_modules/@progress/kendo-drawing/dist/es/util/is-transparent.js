export default function isTransparent(color) {
    return color === "" || color === null || color === "none" || color === "transparent" || color === undefined;
}