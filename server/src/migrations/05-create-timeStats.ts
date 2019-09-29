import { DataTypes, QueryInterface } from 'sequelize';
const withInterval = require('sequelize-interval-postgres');

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    const dataTypesWithInterval = withInterval(dataTypes);
    await queryInterface.createTable('timeStats', {
        type: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        average: dataTypesWithInterval.INTERVAL,
        stddev: dataTypesWithInterval.INTERVAL,
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('timeStats');
};
