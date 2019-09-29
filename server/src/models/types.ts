import { Activity } from "./activity";
import { Model as SModel } from "sequelize";
import { User } from "./user";
import { TimeStats } from "./timeStats";

export type ModelCtor<M extends SModel> = (new () => M) & typeof SModel;

export class Model<T = any, T2 = any> extends SModel<T, T2> {
    static associate?(db: { [key: string]: ModelCtor<any> }): void;
}

export interface ModelMap {
    Activity: typeof Activity;
    User: typeof User;
    TimeStats: typeof TimeStats;
    [key: string]: typeof Model;
}

export interface Interval {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}
