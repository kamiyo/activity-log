import { DataTypes, QueryInterface } from 'sequelize';
const withInterval = require('sequelize-interval-postgres');

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    const dataTypesWithInterval = withInterval(dataTypes);
    await queryInterface.addColumn('activity', 'timeBeforePrev', {
        type: dataTypesWithInterval.INTERVAL,
        allowNull: true,
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('activity', 'timeBeforePrev');
};
