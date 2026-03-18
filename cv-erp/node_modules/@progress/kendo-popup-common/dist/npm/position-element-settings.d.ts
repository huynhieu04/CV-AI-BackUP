import { AlignStrategy } from "./align-strategy";
import { CollisionStrategy } from "./collision-strategy";
import { MarginSettings } from "./margin-settings";
import { OffsetPosition } from "./offset-position";
import { PositionMode } from "./position-mode";
import { ViewPort } from "./view-port";
export interface PositionElementSettings {
    anchor?: HTMLElement | null;
    element: HTMLElement;
    scale?: number;
    anchorAlign: AlignStrategy;
    collisions: CollisionStrategy;
    currentLocation: OffsetPosition;
    elementAlign: AlignStrategy;
    margin: MarginSettings;
    positionMode?: PositionMode;
    viewPort?: ViewPort;
}
