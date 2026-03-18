export default function renderAttr(name, value) {
    return (value !== undefined && value !== null) ? ` ${ name }="${ value }" ` : "";
}