import { DataTypes, Model, Sequelize } from 'sequelize';

type ActivityType = 'meal' | 'poop';

export class Activity extends Model {
    readonly id: string;
    readonly dateTime: Date;
    readonly type: ActivityType;
    readonly amount?: number;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
    Activity.init({
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        dateTime: dataTypes.DATE,
        type: dataTypes.STRING,
        amount: dataTypes.DECIMAL(10, 2),
    }, {
        sequelize,
        tableName: 'activity',
    });

    return Activity;
}