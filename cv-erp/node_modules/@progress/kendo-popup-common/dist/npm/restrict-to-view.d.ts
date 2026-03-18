import { Rect } from './rect';
export type AlignPoint = "top" | "center" | "bottom" | "left" | "middle" | "right";
export type Collision = "flip" | "fit" | "none";
interface ViewPort {
    width: number;
    height: number;
}
interface Margin {
    horizontal?: number;
    vertical?: number;
}
interface FlipOptions {
    offset: number;
    size: number;
    anchorSize: number;
    viewPortSize: number;
    anchorAlignPoint: AlignPoint;
    elementAlignPoint: AlignPoint;
    margin: number;
}
export interface RestrictToViewOptions {
    anchorRect: Rect;
    anchorAlign: {
        vertical: AlignPoint;
        horizontal: AlignPoint;
    };
    elementRect: Rect;
    elementAlign: {
        vertical: AlignPoint;
        horizontal: AlignPoint;
    };
    collisions: {
        vertical: Collision;
        horizontal: Collision;
    };
    viewPort: ViewPort;
    margin?: Margin;
}
declare const fit: (position: number, size: number, viewPortSize: number) => number;
declare const flip: ({ offset, size, anchorSize, viewPortSize, anchorAlignPoint, elementAlignPoint, margin, }: FlipOptions) => number;
export declare const restrictToView: ({ anchorRect, anchorAlign, elementRect, elementAlign, collisions, viewPort, margin, }: RestrictToViewOptions) => {
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
export {};
