import { CollisionType } from "./collision-type";
export interface CollisionStrategy {
    horizontal: CollisionType;
    vertical: CollisionType;
}
