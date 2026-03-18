import { Rect } from "./rect";
interface Location {
    top: number;
    left: number;
}
export declare const applyLocationOffset: (rect: Rect, location: Location, isOffsetBody: boolean) => Rect;
export {};
