import { isCompositeFilterDescriptor } from "./filter-descriptor.interface";
import { getter } from "../accessor";
import { isFunction, isPresent, isDate, isString, isBlank, isArray } from "../utils";
const logic = {
    "or": {
        concat: (acc, fn) => a => acc(a) || fn(a),
        identity: () => false
    },
    "and": {
        concat: (acc, fn) => a => acc(a) && fn(a),
        identity: () => true
    }
};
const operatorsMap = {
    contains: (a, b) => (a || "").indexOf(b) >= 0,
    doesnotcontain: (a, b) => (a || "").indexOf(b) === -1,
    doesnotendwith: (a, b) => (a || "").indexOf(b, (a || "").length - (b || "").length) < 0,
    doesnotstartwith: (a, b) => (a || "").lastIndexOf(b, 0) === -1,
    endswith: (a, b) => (a || "").indexOf(b, (a || "").length - (b || "").length) >= 0,
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    isempty: (a) => a === '',
    isnotempty: (a) => a !== '',
    isnotnull: (a) => isPresent(a),
    isnull: (a) => isBlank(a),
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    neq: (a, b) => a != b,
    startswith: (a, b) => (a || "").lastIndexOf(b, 0) === 0
};
const dateRegExp = /^\/Date\((.*?)\)\/$/;
const convertValue = (value, ignoreCase) => {
    if (value != null && isString(value)) {
        const date = dateRegExp.exec(value);
        if (date) {
            return new Date(+date[1]).getTime();
        }
        else if (ignoreCase) {
            return value.toLowerCase();
        }
    }
    else if (value != null && isDate(value)) {
        return value.getTime();
    }
    return value;
};
const typedGetter = (prop, value, ignoreCase, operator) => {
    if (!isPresent(value)) {
        return prop;
    }
    let acc = prop;
    if (isString(value)) {
        const date = dateRegExp.exec(value);
        if (date) {
            value = new Date(+date[1]);
        }
        else {
            // For custom operators (functions), we should not transform the field value
            // This allows custom operators to receive the original data type (e.g., arrays)
            const isCustomOperator = isFunction(operator);
            acc = a => {
                const x = prop(a);
                if (x === null) {
                    return x;
                }
                // Don't convert arrays to strings when using custom operators
                if (isCustomOperator && isArray(x)) {
                    return x;
                }
                const stringValue = typeof x === 'string' ? x : x + "";
                return ignoreCase ? stringValue.toLowerCase() : stringValue;
            };
        }
    }
    if (isDate(value)) {
        return a => {
            const x = acc(a);
            return isDate(x) ? x.getTime() : x;
        };
    }
    return acc;
};
const transformFilter = ({ field, ignoreCase, value, operator }) => {
    field = !isPresent(field) ? a => a : field;
    ignoreCase = isPresent(ignoreCase) ? ignoreCase : true;
    const itemProp = typedGetter(isFunction(field) ? field : getter(field, true), value, ignoreCase, operator);
    value = convertValue(value, ignoreCase);
    const op = isFunction(operator) ? operator : operatorsMap[operator];
    return a => op(itemProp(a), value, ignoreCase);
};
/**
 * @hidden
 */
export const transformCompositeFilter = (filter) => {
    const combiner = logic[filter.logic];
    return filter.filters
        .filter(isPresent)
        .map(x => isCompositeFilterDescriptor(x) ? transformCompositeFilter(x) : transformFilter(x))
        .reduce(combiner.concat, combiner.identity);
};
