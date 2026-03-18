import { AlignStrategy } from "./align-strategy";
import { Rect } from "./rect";
import { MarginSettings } from "./margin-settings";
export interface AlignSettings {
    anchorRect: Rect;
    anchorAlign: AlignStrategy;
    elementRect: Rect;
    elementAlign: AlignStrategy;
    margin?: MarginSettings;
}
