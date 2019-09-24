import { DataTypes, Model, Sequelize } from 'sequelize';
import { string } from 'prop-types';

type ActivityType = 'meal' | 'poop' | 'nurse' | 'bath' | 'sleep';

export class Activity extends Model {
    readonly id: string;
    readonly dateTime: Date;
    readonly type: ActivityType;
    readonly amount?: number;
    readonly notes: string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
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
    }, {
        sequelize,
        tableName: 'activity',
    });

    return Activity;
}