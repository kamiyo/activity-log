import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    await queryInterface.addColumn('activity', 'notes', {
        type: dataTypes.TEXT(),
        defaultValue: '',
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('activity', 'notes');
};
