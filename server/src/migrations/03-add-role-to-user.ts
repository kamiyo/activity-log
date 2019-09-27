import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    await queryInterface.addColumn('user', 'role', {
        type: dataTypes.STRING,
        defaultValue: 'read',
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('user', 'role');
};
