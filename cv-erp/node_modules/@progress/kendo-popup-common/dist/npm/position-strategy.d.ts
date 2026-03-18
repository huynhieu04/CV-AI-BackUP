import { OffsetPosition } from "./offset-position";
export interface PositionStrategy {
    flipped: boolean;
    fitted: boolean;
    flip: {
        vertical: boolean;
        horizontal: boolean;
    };
    fit: {
        vertical: boolean;
        horizontal: boolean;
    };
    offset: OffsetPosition;
}
