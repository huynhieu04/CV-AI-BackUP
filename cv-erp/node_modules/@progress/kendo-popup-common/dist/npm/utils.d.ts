import { OffsetPosition } from "./offset-position";
import { Rect } from "./rect";
export declare const utils: {
    eitherRect: (rect: Rect | null, offset: OffsetPosition) => Rect;
    scaleRect: (rect: Rect | null, scale: number) => Rect | null;
    removeStackingOffset: (rect: Rect, stackingOffset: OffsetPosition | null) => Rect;
    hasRelativeStackingContext: (elementSource?: HTMLElement) => boolean;
    canUseDOM: () => boolean;
};
