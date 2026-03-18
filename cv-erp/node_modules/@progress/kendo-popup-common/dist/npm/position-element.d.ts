import { PositionElementSettings } from './position-element-settings';
interface PositionElementResult {
    flip: {
        vertical: boolean;
        horizontal: boolean;
    };
    flipped: boolean;
    fit: {
        vertical: boolean;
        horizontal: boolean;
    };
    fitted: boolean;
    offset: {
        top: number;
        left: number;
    };
}
export declare const positionElement: (settings: PositionElementSettings) => PositionElementResult;
export {};
