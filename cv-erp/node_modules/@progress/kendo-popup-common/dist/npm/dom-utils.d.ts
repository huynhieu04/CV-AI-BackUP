import { OffsetPosition } from './offset-position';
interface FontStyle {
    key: string;
    value: string;
}
export declare const domUtils: {
    addOffset: (current: OffsetPosition, addition: OffsetPosition) => OffsetPosition;
    addScroll: (rect: import("./rect").Rect, scroll: import("./scroll-info").ScrollInfo) => import("./rect").Rect;
    align: (options: import("./align").AlignOptions) => {
        top: number;
        left: number;
    };
    boundingOffset: (element: any) => import("./bounding-offset").BoundingOffset;
    getFontStyles: (el: HTMLElement) => FontStyle[];
    getWindow: () => Window | null;
    hasOffsetParent: (el: HTMLElement) => boolean;
    offset: (el: HTMLElement) => OffsetPosition | null;
    offsetAtPoint: (element: HTMLElement, currentLocation: OffsetPosition) => OffsetPosition | null;
    position: (element: HTMLElement, popupElement: HTMLElement, scale?: number) => OffsetPosition | null;
    removeScroll: (rect: import("./rect").Rect, scroll: import("./scroll-info").ScrollInfo) => import("./rect").Rect;
    restrictToView: ({ anchorRect, anchorAlign, elementRect, elementAlign, collisions, viewPort, margin, }: import("./restrict-to-view").RestrictToViewOptions) => {
        flipped: boolean;
        fitted: boolean;
        flip: {
            horizontal: boolean;
            vertical: boolean;
        };
        fit: {
            horizontal: boolean;
            vertical: boolean;
        };
        offset: {
            left: number;
            top: number;
        };
    };
    scrollPosition: (element: HTMLElement) => import("./scroll-position").ScrollPosition;
    scrollableParents: (element: HTMLElement) => HTMLElement[];
    getRelativeContextElement: (el: HTMLElement) => HTMLElement | null;
    stackingElementOffset: (el: HTMLElement) => {
        left: number;
        top: number;
    } | null;
    stackingElementScroll: (el: HTMLElement) => {
        x: number;
        y: number;
    };
    stackingElementViewPort: (el: HTMLElement) => {
        height: number;
        width: number;
    } | null;
    useRelativePosition: (el: HTMLElement) => boolean;
    windowViewport: (element: HTMLElement) => import("./window-viewport").Viewport;
    zoomLevel: () => number;
    isZoomed: () => boolean;
    zIndex: (anchor: HTMLElement, container: HTMLElement) => number | null;
};
export {};
