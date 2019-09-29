import { DataTypes, Model, Sequelize } from 'sequelize';
const withInterval = require('sequelize-interval-postgres');

export const ActivityTypeMap: Record<ActivityType, string> = {
    meal: 'meal',
    poop: 'poop',
    nurse: 'nurse',
    bath: 'bath',
    sleep: 'sleep',
}

export type ActivityType = 'meal' | 'poop' | 'nurse' | 'bath' | 'sleep';

export class Activity extends Model {
    readonly id: string;
    readonly dateTime: Date;
    readonly type: ActivityType;
    readonly amount?: number;
    readonly notes: string;
    readonly timeBeforePrev: number;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
    const dataTypesWithInterval = withInterval(dataTypes);

    Activity.init({
        id: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        dateTime: dataTypes.DATE,
        type: dataTypes.STRING,
        amount: dataTypes.DECIMAL(10, 2),
        notes: dataTypes.TEXT(),
        timeBeforePrev: dataTypesWithInterval.INTERVAL,
    }, {
        sequelize,
        tableName: 'activity',
    });

    return Activity;
}