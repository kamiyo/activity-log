import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    await queryInterface.addColumn('activity', 'timeBeforePrev', {
        type: dataTypes.BIGINT,
        allowNull: true,
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('activity', 'timeBeforePrev');
};
