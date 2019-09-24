import { Activity } from "./activity";
import { Model as SModel } from "sequelize";
import { User } from "./user";

export type ModelCtor<M extends Model> = (new () => M) & typeof Model;

export class Model<T = any, T2 = any> extends SModel<T, T2> {
    static associate?(db: { [key: string]: ModelCtor<any> }): void;
}

export interface ModelMap {
    Activity: typeof Activity;
    User: typeof User;
    [key: string]: typeof Model;
}
