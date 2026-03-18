/**
 * @hidden
 */
export function elementOffset(element: Element): { top: number, left: number };

/**
 * @hidden
 */
export function limitValue(value: number, min: number, max: number): number;

/**
 * @hidden
 */
export function deg(radians: number): number;

/**
 * @hidden
 */
export function round(value: number, precision?: number): number;

/**
 * @hidden
 */
export function setInnerHTML(container: Element, html: string): void;

/**
 * @hidden
 */
export function measureText(text: string, style?: any, options?: { box?: Element; normalizeText?: boolean; }): {
    width: number;
    height: number;
    baseline: number;
};
