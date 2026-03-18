import { AlignStrategy } from "./align-strategy";
import { MarginSettings } from "./margin-settings";
import { OffsetPosition } from "./offset-position";
import { PositionMode } from "./position-mode";
export interface AlignElementSettings {
    anchor?: HTMLElement | null;
    element: HTMLElement;
    scale?: number;
    anchorAlign: AlignStrategy;
    elementAlign: AlignStrategy;
    margin?: MarginSettings;
    offset?: OffsetPosition;
    positionMode?: PositionMode;
}
