import { Rect } from './rect';
export interface AlignOptions {
    anchorRect: Rect;
    anchorAlign: {
        horizontal: string;
        vertical: string;
    };
    elementRect: Rect;
    elementAlign: {
        horizontal: string;
        vertical: string;
    };
    margin?: {
        horizontal?: number;
        vertical?: number;
    };
}
export declare const align: (options: AlignOptions) => {
    top: number;
    left: number;
};
