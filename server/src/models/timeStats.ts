import { DataTypes, Model, Sequelize } from 'sequelize';
import { Interval } from './types';
const withInterval = require('sequelize-interval-postgres');

export class TimeStats extends Model {
    readonly id: string;
    readonly average: Interval;
    readonly stddev: Interval;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
    const dataTypesWithInterval = withInterval(dataTypes);
    TimeStats.init({
        type: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        average: dataTypesWithInterval.INTERVAL,
        stddev: dataTypesWithInterval.INTERVAL,
    }, {
        sequelize,
        tableName: 'timeStats',
    });

    return TimeStats;
}